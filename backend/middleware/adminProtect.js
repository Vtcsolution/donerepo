// middleware/adminProtect.js
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const adminProtect = async (req, res, next) => {
  const token = req.cookies.admin_token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(403).json({ message: "Not authorized" });

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = { adminProtect };
