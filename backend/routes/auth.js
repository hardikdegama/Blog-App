const express = require("express");
const router = express.Router();
const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../config/mail");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "You are not a registered user." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect password." });

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login." });
  }
});

// Send OTP for forgot password
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// Verify OTP and reset password
// Verify OTP and reset password
router.post("/verify-otp-reset", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const record = await OTP.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP not found. Please request a new OTP." });
    }

    // ✅ Check OTP match
    if (otp.trim() !== record.otp) {
      return res.status(400).json({ message: "Invalid OTP. Please enter the correct OTP." });
    }

    // ✅ Check expiry
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new OTP." });
    }

    // ✅ Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ email }, { password: hashedPassword });
    await OTP.deleteOne({ email });

    return res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("Error in /verify-otp-reset:", err);
    return res.status(500).json({ message: "Error updating password" });
  }
});
