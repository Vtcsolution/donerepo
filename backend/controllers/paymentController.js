const mongoose = require("mongoose");
const { createMollieClient } = require("@mollie/api-client");
const Wallet = require("../models/Wallet");
const Payment = require("../models/Payment");

const mollieClient = createMollieClient({ 
  apiKey: process.env.MOLLIE_TEST_API_KEY 
});

exports.createWalletTopup = async (req, res) => {
  try {
    const { amount, planName, creditsPurchased, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate input
    if (amount < 1) return res.status(400).json({ error: "Amount must be at least €1" });
    if (!planName || !creditsPurchased || !paymentMethod) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // URL construction with validation
    const getValidUrl = (base, path) => {
      try {
        return new URL(path, base).toString();
      } catch (err) {
        console.error(`Invalid URL: ${base}${path}`, err);
        throw new Error('Invalid URL configuration');
      }
    };

    const webhookUrl = getValidUrl(
      process.env.NODE_ENV === 'production' 
        ? process.env.BACKEND_URL 
        : 'https://webhook.site', // Temporary for development
      '/api/payments/webhook'
    );

    const redirectUrl = getValidUrl(
      process.env.FRONTEND_URL || 'http://localhost:5173',
      '/payment/result'
    );

    // Create Mollie payment
    const payment = await mollieClient.payments.create({
      amount: {
        value: amount.toFixed(2),
        currency: "EUR"
      },
      description: `Purchase: ${planName} (${creditsPurchased} credits)`,
      redirectUrl, // Use base redirectUrl without payment ID
      webhookUrl,
      method: paymentMethod,
      metadata: {
        userId: userId.toString(),
        planName,
        creditsPurchased,
        timestamp: new Date().toISOString()
      }
    });

    // Append payment ID to redirect URL for database storage
    const finalRedirectUrl = `${redirectUrl}?id=${payment.id}`;

    // Save payment to DB
    const newPayment = new Payment({
      userId,
      amount,
      planName,
      creditsPurchased,
      paymentMethod,
      molliePaymentId: payment.id,
      status: "pending",
      createdAt: new Date(),
      redirectUrl: finalRedirectUrl,
      webhookUrl
    });

    await newPayment.save();

    console.log('Payment created:', {
      paymentId: payment.id,
      redirectUrl: finalRedirectUrl,
      checkoutUrl: payment.getCheckoutUrl(),
      userId,
      amount,
      planName,
      creditsPurchased,
      paymentMethod
    });

    res.json({
      success: true,
      paymentUrl: payment.getCheckoutUrl(),
      paymentId: payment.id
    });
    
  } catch (error) {
    console.error("Payment creation failed:", {
      error: error.message,
      stack: error.stack,
      mollieError: error.field ? `Mollie error: ${error.field}` : undefined
    });
    
    res.status(500).json({ 
      error: "Payment initialization failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const paymentId = req.body.id;
    if (!paymentId) {
      console.error('Webhook: No payment ID provided');
      return res.status(400).send("No payment ID provided");
    }

    const payment = await mollieClient.payments.get(paymentId);
    console.log('Webhook: Payment status:', { paymentId, status: payment.status });

    const dbPayment = await Payment.findOne({ molliePaymentId: paymentId });
    if (!dbPayment) {
      console.error('Webhook: Payment not found in database', { paymentId });
      return res.status(404).send("Payment not found in database");
    }

    // Update payment status
    dbPayment.status = payment.status;
    dbPayment.updatedAt = new Date();

    if (payment.status === 'paid' && dbPayment.creditsAdded === 0) {
      try {
        dbPayment.creditsAdded = dbPayment.creditsPurchased;
        await dbPayment.save();

        const walletUpdate = await Wallet.findOneAndUpdate(
          { userId: dbPayment.userId },
          {
            $inc: {
              balance: dbPayment.creditsPurchased,
              credits: dbPayment.creditsPurchased
            },
            $set: { lastTopup: new Date() }
          },
          { upsert: true, new: true }
        );

        console.log('Webhook: Wallet updated successfully:', {
          userId: dbPayment.userId.toString(),
          creditsAdded: dbPayment.creditsPurchased,
          wallet: {
            balance: walletUpdate.balance,
            credits: walletUpdate.credits,
            lastTopup: walletUpdate.lastTopup
          }
        });
      } catch (walletError) {
        console.error('Webhook: Failed to update wallet:', {
          error: walletError.message,
          stack: walletError.stack,
          userId: dbPayment.userId.toString(),
          creditsPurchased: dbPayment.creditsPurchased
        });
        // Save payment status even if wallet update fails
        await dbPayment.save();
        return res.status(500).send("Webhook processed but wallet update failed");
      }
    } else {
      await dbPayment.save();
      console.log('Webhook: Payment status updated:', { paymentId, status: payment.status });
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error('Webhook processing failed:', {
      error: error.message,
      stack: error.stack,
      paymentId: req.body.id
    });
    res.status(500).send("Error processing webhook");
  }
};

exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findOne({ molliePaymentId: paymentId });
    if (!payment) {
      console.error('checkPaymentStatus: Payment not found', { paymentId });
      return res.status(404).json({ error: "Payment not found" });
    }

    // Verify with Mollie to ensure sync
    const molliePayment = await mollieClient.payments.get(paymentId);
    if (molliePayment.status !== payment.status) {
      payment.status = molliePayment.status;
      payment.updatedAt = new Date();
      await payment.save();
      console.log('checkPaymentStatus: Synced payment status with Mollie', {
        paymentId,
        status: molliePayment.status
      });

      // If status is now paid and credits not added, update wallet
      if (molliePayment.status === 'paid' && payment.creditsAdded === 0) {
        try {
          payment.creditsAdded = payment.creditsPurchased;
          await payment.save();

          const walletUpdate = await Wallet.findOneAndUpdate(
            { userId: payment.userId },
            {
              $inc: {
                balance: payment.creditsPurchased,
                credits: payment.creditsPurchased
              },
              $set: { lastTopup: new Date() }
            },
            { upsert: true, new: true }
          );

          console.log('checkPaymentStatus: Wallet updated after sync:', {
            userId: payment.userId.toString(),
            creditsAdded: payment.creditsPurchased,
            wallet: {
              balance: walletUpdate.balance,
              credits: walletUpdate.credits,
              lastTopup: walletUpdate.lastTopup
            }
          });
        } catch (walletError) {
          console.error('checkPaymentStatus: Failed to update wallet:', {
            error: walletError.message,
            stack: walletError.stack,
            userId: payment.userId.toString(),
            creditsPurchased: payment.creditsPurchased
          });
        }
      }
    }

    res.json({
      status: payment.status,
      amount: payment.amount,
      creditsAdded: payment.creditsAdded
    });
  } catch (error) {
    console.error("Error checking payment status:", {
      error: error.message,
      stack: error.stack,
      paymentId: req.params.paymentId
    });
    res.status(500).json({ error: "Error checking payment status" });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .select("-webhookUrl");
    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error("Error fetching user payments:", {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    res.status(500).json({ error: "Failed to fetch user payments" });
  }
};