const Message = require("../models/Message");
const transporter = require("../config/mailer");

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Alle velden zijn verplicht." });
    }

    // Save to DB
    const newMessage = await Message.create({ name, email, message, user: req.user?._id });

    // Send email to admin
    await transporter.sendMail({
      from: `"Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Admin email
      subject: "Nieuw bericht via contactformulier",
      html: `
        <h3>Nieuw bericht ontvangen</h3>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Bericht:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Bericht verzonden en opgeslagen." });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Er ging iets mis. Probeer opnieuw." });
  }
};
