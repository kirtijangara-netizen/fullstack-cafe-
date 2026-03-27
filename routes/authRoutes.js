// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// If any of these are 'undefined', the app crashes with that TypeError
router.get("/login", authController.showLogin);
router.get("/signup", authController.showSignup);

router.post("/signup", authController.signup);
router.post("/send-otp", authController.sendOTP); // Check spelling here!
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;