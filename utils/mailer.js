const nodemailer = require("nodemailer");

// ================= CONFIGURE TRANSPORTER =================
const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // MUST BE 16-DIGIT APP PASSWORD
  },
});

/**
 * Utility function to send OTP Email
 */
const sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Gourmet Hub" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your Verification Code",
    text: `Your OTP for signup is: ${otp}. It expires in 5 minutes.`,
    html: `
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <h2 style="color: #e77600;">Gourmet Hub Verification</h2>
            <p>Your one-time password (OTP) is:</p>
            <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
            <p>This code expires in 5 minutes.</p>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent: " + info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Mailer Error:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail };