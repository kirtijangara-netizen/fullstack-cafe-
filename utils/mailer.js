const nodemailer = require("nodemailer");

// ================= CONFIGURE TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL ke liye 465 best hai Render par
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Aapka 16-digit App Password
  },
  tls: {
    // Isse "Self-signed certificate" ya "Unauthorized" error nahi aayega
    rejectUnauthorized: false
  }
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
        <div style="font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="color: #e77600;">Gourmet Hub Verification</h2>
            <p>Your one-time password (OTP) is:</p>
            <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px; border-radius: 5px;">${otp}</h1>
            <p style="color: #555;">This code expires in 5 minutes.</p>
        </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent: " + info.response);
    return { success: true };
  } catch (error) {
    // Isse Render ke Logs mein exact error dikhega
    console.error("❌ Mailer Error Details:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail };