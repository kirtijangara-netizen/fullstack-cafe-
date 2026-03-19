// controllers/supportController.js

const Support = require("../models/Support"); // ✅ Import model

// ================= GET SUPPORT PAGE =================
exports.getSupportPage = (req, res) => {
  res.render("support", {
    title: "Support",
    user: req.user || null,
    message: null
  });
};

// ================= SUBMIT SUPPORT FORM =================
exports.submitSupportForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // ✅ Validation
    if (!name || !email || !subject || !message) {
      return res.render("support", {
        message: "All fields are required!",
        user: req.user || null
      });
    }

    // ✅ Save to MongoDB
    const newSupport = new Support({
      userName: name,
      userEmail: email,
      subject: subject,
      message: message
    });

    await newSupport.save();

    console.log("Support Request Saved:", newSupport);

    res.render("support", {
      message: "Submitted successfully!",
      user: req.user || null
    });

  } catch (error) {
    console.error("Support Error:", error);

    res.render("support", {
      message: "Something went wrong!",
      user: req.user || null
    });
  }
};