const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");



// GET routes
router.get("/login", authController.showLogin);
router.get("/signup", authController.showSignup);

// POST routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;