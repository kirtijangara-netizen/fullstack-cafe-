const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SECRET_KEY = process.env.SECRET_KEY || "mysecretkey";

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

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });

    // role will default to "user"
    await User.create({
      name,
      email,
      password,
      role: "user"
    });

    return res.status(201).json({
      success: true,
      redirect: "/login?signup=success"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({
      success: false,
      message: "All fields required"
    });

  try {
    const user = await User.findOne({ email });

    if (!user || user.password !== password)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });

    // ensure role always exists
    const role = user.role || "user";

    // create token with role
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict"
    });

    // redirect based on role
    const redirectPath = role === "admin"
      ? "/admin"
      : "/products";

    return res.json({
      success: true,
      redirect: redirectPath
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ================= LOGOUT =================
exports.logout = (req, res) => {
  res.clearCookie("token");
  return res.json({
    success: true,
    redirect: "/login"
  });
};