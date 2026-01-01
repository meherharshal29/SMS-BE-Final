const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, otp, name) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Smart Media" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: `<h3>Hello ${name},</h3><p>Your OTP is: <b>${otp}</b></p>`
        });
        console.log("✅ Email Sent");
    } catch (error) {
        console.error("❌ Email Error:", error);
    }
};

module.exports = sendEmail;