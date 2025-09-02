const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // port 465 needs SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // make sure you set this in your .env
  },
});

module.exports = transporter;
