const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const sendOTPEmail = async (to, otp) => {
    try {
        // Checking if environment variables are loaded
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.REFRESH_TOKEN) {
            throw new Error("Missing credentials in .env file");
        }

        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        // Generate a fresh access token
        const accessTokenResponse = await oauth2Client.getAccessToken();
        const accessToken = accessTokenResponse.token;

        if (!accessToken) {
            throw new Error("Refresh token might be expired or invalid.");
        }

        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: process.env.REFRESH_TOKEN
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const subject = "Your OTP Verification Code";
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #e77600;">Gourmet Hub</h2>
                <p>Use the following code to verify your account:</p>
                <h1 style="background: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h1>
                <p>This code expires in 5 minutes.</p>
            </div>
        `;

        // Format MIME string for Gmail API
        const str = [
            `To: ${to}`,
            `Content-Type: text/html; charset=utf-8`,
            `MIME-Version: 1.0`,
            `Subject: ${subject}`,
            ``,
            htmlContent
        ].join('\n');

        const encodedMail = Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: encodedMail }
        });

        console.log(`✅ Success: OTP sent to ${to}`);
        return { success: true };
    } catch (err) {
        console.error("❌ Gmail API Error:", err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { sendOTPEmail };