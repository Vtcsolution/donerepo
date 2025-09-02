// controllers/adminController.js
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({
      success: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        image: admin.image,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// POST /api/admin/register
const registerAdmin = async (req, res) => {
  try {
    const { email, password, name, image } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }

    const newAdmin = new Admin({ email, password, name, image });
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin: {
        _id: newAdmin._id,
        email: newAdmin.email,
        name: newAdmin.name,
        image: newAdmin.image,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};


// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      image: admin.image,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch admin profile" });
  }
};

// PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Update fields
    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.image = req.body.image || admin.image;

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== "") {
      admin.password = req.body.password; // Only set plain text, hook will hash it
    }

    await admin.save();

    res.status(200).json({
      _id: admin._id,
      email: admin.email,
      name: admin.name,
      image: admin.image,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update admin" });
  }
};


const logoutAdmin = (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "Admin logged out successfully" });
};

module.exports = {
  loginAdmin,
  registerAdmin,  
  logoutAdmin,
  getAdminProfile,
  updateAdminProfile,
};
