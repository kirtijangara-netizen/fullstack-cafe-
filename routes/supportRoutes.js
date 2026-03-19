const express = require("express");
const router = express.Router();
const { getSupportPage, submitSupportForm } = require("../controllers/supportController");

// GET support page
router.get("/", getSupportPage);

// POST support form
router.post("/", submitSupportForm);

module.exports = router;