const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey";

// Simple in-memory storage for OTPs
const otpStore = {}; 

// ================= CONFIGURE NODEMAILER =================
// IMPORTANT: Replace the strings below with your real info or use process.env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-real-email@gmail.com", 
    pass: process.env.EMAIL_PASS || "your-16-char-app-password" 
  }
});

// ================= SHOW LOGIN =================
exports.showLogin = (req, res) => {
  res.render("login", {
    signupSuccess: req.query.signup === "success",
    user: req.user || null
  });
};

// ================= SHOW SIGNUP =================
exports.showSignup = (req, res) => {
  res.render("signup", { user: req.user || null });
};

// ================= SEND OTP =================
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 300000 }; 

    // Using the authenticated user email for the 'from' field
    const senderEmail = process.env.EMAIL_USER || "your-real-email@gmail.com";

    await transporter.sendMail({
      from: `"Amazon Central" <${senderEmail}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your OTP for signup is: ${otp}. It expires in 5 minutes.`
    });

    console.log(`✅ OTP sent successfully to ${email}`);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Email Error:", err);
    res.status(500).json({ success: false, message: "Error sending email" });
  }
};

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  const { name, email, password, otp } = req.body;

  if (!name || !email || !password || !otp)
    return res.status(400).json({ success: false, message: "All fields and OTP required" });

  try {
    const storedData = otpStore[email];
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    await User.create({ name, email, password, role: "user" });
    delete otpStore[email]; 

    return res.status(201).json({ success: true, redirect: "/login?signup=success" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const role = user.role || "user";
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    const redirectPath = role === "admin" ? "/admin" : "/products";

    return res.json({ success: true, redirect: redirectPath });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, redirect: "/login" });
};