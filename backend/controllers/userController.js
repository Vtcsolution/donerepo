const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Payment = require('../models/Payment');
const NumerologyReport = require('../models/NumerologyReport');
const { generateNumerologyReport, createNarrativeReport } = require('./numerologyController');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  }); 
};

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, dob, birthTime, birthPlace, image,gender } = req.body;

    // Validate required fields
    if (!firstName || !email || !password || !confirmPassword || !dob || !gender) {
      return res.status(400).json({ message: 'First name, email, password, confirm password, and date of birth are required' });
    }

    // Generate username from firstName and lastName
    const username = `${firstName}${lastName ? ' ' + lastName : ''}`.trim();

    // Validate password matching
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate DOB format (YYYY-MM-DD)
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob)) {
      return res.status(400).json({ message: 'Date of birth must be in YYYY-MM-DD format' });
    }
if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ message: 'Gender must be either male or female' });
    }
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date of birth' });
    }


    // Ensure DOB is not in the future
    const today = new Date();
    if (dobDate > today) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName: lastName || "",
      username,
      email,
      password: hashedPassword,
      dob: dobDate,
      birthTime,
      birthPlace,
      image,
      gender,
      hasRequestedFreeReport: true,
    });

    // Generate numerology report
    const numerologyData = await generateNumerologyReport(firstName, lastName || "", dob);
    const narrative = await createNarrativeReport(numerologyData, firstName);

    // Save numerology report to database
    const numerologyReport = new NumerologyReport({
      userId: newUser._id,
      numbers: {
        lifepath: numerologyData.lifepath,
        expression: numerologyData.expression,
        soulurge: numerologyData.soulurge,
        personality: numerologyData.personality,
      },
      narrative,
    });
    await numerologyReport.save();

    const token = generateToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

   res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1 * 24 * 60 * 60 * 1000,  // 1 day
});

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        dob: newUser.dob.toISOString().split('T')[0],
        birthTime: newUser.birthTime,
        birthPlace: newUser.birthPlace,
        image: newUser.image,
        gender: newUser.gender,
      },
      numerologyData: {
        numbers: {
          lifepath: numerologyData.lifepath,
          expression: numerologyData.expression,
          soulurge: numerologyData.soulurge,
          personality: numerologyData.personality,
        },
        narrative,
        source: numerologyData.source || 'API',
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

   res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1 * 24 * 60 * 60 * 1000,  // 1 day
});

    res.status(200).json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateToken(user._id);
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email image bio dob totalTime totalPayment createdAt");
    
    const usersWithCredits = await Promise.all(users.map(async (user) => {
      let wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) {
        wallet = await Wallet.create({
          userId: user._id,
          balance: 0,
          credits: 0
        });
        console.log(`Created wallet for user ${user._id}`);
      }
      return {
        ...user.toObject(),
        credits: wallet.credits
      };
    }));

    console.log('Users with credits:', usersWithCredits);
    res.status(200).json({ 
      success: true, 
      users: usersWithCredits 
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getUserByAdmin = async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wallet = await Wallet.findOne({ userId });
    const payments = await Payment.find({ userId }).select('amount planName creditsPurchased paymentMethod molliePaymentId status creditsAdded createdAt');

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        credits: wallet ? wallet.credits : 0,
        payments: payments.map(payment => ({
          amount: payment.amount,
          planName: payment.planName,
          creditsPurchased: payment.creditsPurchased,
          paymentMethod: payment.paymentMethod,
          molliePaymentId: payment.molliePaymentId,
          status: payment.status,
          creditsAdded: payment.creditsAdded,
          createdAt: payment.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user details by admin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const deleteUserById = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ 
        message: 'If this email exists in our system, you will receive a password reset link'
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    // Create reusable transporter object using Mailtrap for testing
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.strato.com',
      port: process.env.SMTP_PORT || 465,
      auth: {
        user: process.env.SMTP_USER || 'info@spiritueelchatten.com',
        pass: process.env.SMTP_PASS || 'Kikkerss15!'
      }
    });

    // Email content
    const mailOptions = {
      from: 'Spiritueel Chatten <info@spiritueelchatten.com>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>Hi ${user.username || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to create a new one.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <a href="${resetLink}" 
             style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 0.9em;">
            This link will expire in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetLink}</p>
        </div>
      `,
      text: `Hi ${user.username || 'there'},

We received a request to reset your password. Use this link to create a new one:
${resetLink}

If you didn't request this, you can safely ignore this email.

This link will expire in 1 hour.`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ 
      message: 'Password reset link has been sent if the email exists in our system'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      message: 'An error occurred while processing your request'
    });
  }
};

// Reset Password function remains the same

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired password reset link. Please request a new one.' 
      });
    }

    // Update password and clear token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      message: 'An error occurred while resetting your password'
    });
  }
};


const fetchUserById = async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: 'User not found' });

    const wallet = await Wallet.findOne({ userId });
    const payments = await Payment.find({ userId }).select('amount planName creditsPurchased paymentMethod molliePaymentId status creditsAdded createdAt');

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        credits: wallet ? wallet.credits : 0,
        payments: payments.map(payment => ({
          amount: payment.amount,
          planName: payment.planName,
          creditsPurchased: payment.creditsPurchased,
          paymentMethod: payment.paymentMethod,
          molliePaymentId: payment.molliePaymentId,
          status: payment.status,
          creditsAdded: payment.creditsAdded,
          createdAt: payment.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateUserById = async (req, res) => {
  const { userId } = req.params;
  const { username, email, image, dob, bio,birthTime } = req.body;


  // Validate ObjectId
  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate and update inputs
    if (username) {
      if (username.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters long" });
      }
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    // Store image as provided (no Cloudinary validation)
    if (image !== undefined) {
      user.image = image || "";
    }

    if (dob) {
      const parsedDate = new Date(dob);
      if (isNaN(parsedDate.getTime())) { // Fixed typo
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (parsedDate > new Date()) {
        return res.status(400).json({ message: "Date of birth cannot be in the future" });
      }
      user.dob = parsedDate;
    }

    if (bio) {
      if (bio.length > 500) {
        return res.status(400).json({ message: "Bio cannot exceed 500 characters" });
      }
      user.bio = bio;
    }
if (birthTime) {
  const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/; 
  if (!timeRegex.test(birthTime)) {
    return res.status(400).json({ message: "Invalid birth time format (expected HH:mm)" });
  }
  user.birthTime = birthTime;
}
    await user.save();

    // Return updated user data (excluding sensitive fields)
    const updatedUser = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  registerUser,
  getAllUsers,
  loginUser,
  logoutUser,
 refreshToken,
  forgetPassword,
  resetPassword,
  fetchUserById,
  deleteUserById,
  updateUserById,
  updatePassword,
  getMe,
  getUserByAdmin
};