const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { sendOTPEmail } = require("../utils/mailer"); 

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey";
const otpStore = {}; 

exports.showLogin = (req, res) => {
  res.render("login", { signupSuccess: req.query.signup === "success", user: req.user || null });
};

exports.showSignup = (req, res) => {
  res.render("signup", { user: req.user || null });
};

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 300000 }; 

    // Calling the fixed mailer utility
    const result = await sendOTPEmail(email, otp);

    if (result.success) {
      console.log(`✅ OTP [${otp}] logged for ${email}`);
      return res.json({ success: true, message: "OTP sent to email" });
    } else {
      return res.status(500).json({ success: false, message: "Mailer failed: " + result.error });
    }
  } catch (err) {
    console.error("❌ SendOTP Controller Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.signup = async (req, res) => {
  const { name, email, password, otp } = req.body;
  if (!name || !email || !password || !otp)
    return res.status(400).json({ success: false, message: "All fields required" });

  try {
    const storedData = otpStore[email];
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    // Note: In production, remember to hash passwords using bcrypt!
    await User.create({ name, email, password, role: "user" });
    delete otpStore[email]; 

    return res.status(201).json({ success: true, redirect: "/login?signup=success" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error during signup" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role || "user" }, SECRET_KEY, { expiresIn: "1h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    
    return res.json({ success: true, redirect: user.role === "admin" ? "/admin" : "/products" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, redirect: "/login" });
};