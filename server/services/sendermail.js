const nodeMailer = require('nodemailer');
require('dotenv').config();
// const transporter = nodeMailer.createTransport({
//     host: process.env.MAIL_SERVER,
//     port: Number(process.env.MAIL_PORT),
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD
//     }
// });
console.log("MAIL_USERNAME:", process.env.MAIL_USERNAME);
console.log("MAIL_PASSWORD:", process.env.MAIL_PASSWORD ? "Loaded" : "Missing");
console.log("MAIL_SERVER:", process.env.MAIL_SERVER);
console.log("MAIL_PORT:", process.env.MAIL_PORT);
const transporter = nodeMailer.createTransport({
    host: process.env.MAIL_SERVER,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
    },
});
let isSmtpReady = false;
transporter.verify((error, success) => {
    if (error) {
        console.log("⚠️ SMTP verification failed. Email features will log to console.");
        isSmtpReady = false;
    } else {
        console.log("SMTP READY");
        isSmtpReady = true;
    }
});

const sendVerificationEmail = async (email, name, token) => {
    try {
        const verificationLink =
            `${process.env.SERVER_URL || 'http://localhost:3001'}/api/users/verify-email/${token}`;

        console.log("\n=========================================");
        console.log("✉️  [LOCAL DEV] VERIFICATION EMAIL INFO:");
        console.log(`To: ${email}`);
        console.log(`Name: ${name}`);
        console.log(`Link: ${verificationLink}`);
        console.log("=========================================\n");

        if (!isSmtpReady) {
            console.log("ℹ️  Skipping real email dispatch (SMTP not configured/ready).");
            return;
        }

        const info = await transporter.sendMail({
            from: `"ShopMate" <${process.env.MAIL_USERNAME}>`,
            to: email,
            subject: "Email Verification",
            html: `
                <p>Hello ${name},</p>
                <p>Please verify your email:</p>
                <a href="${verificationLink}">Verify Email</a>
            `,
        });

        console.log("✅ Mail sent:", info.messageId);
    } catch (err) {
        console.error("⚠️ Mail Error during send:", err.message);
    }
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        console.log("\n=========================================");
        console.log("✉️  [LOCAL DEV] SEND EMAIL INFO:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        if (text) console.log(`Text: ${text}`);
        console.log("=========================================\n");

        if (!isSmtpReady) {
            console.log("ℹ️  Skipping real email dispatch (SMTP not configured/ready).");
            return;
        }

        const info = await transporter.sendMail({
            from: `"ShopMate" <${process.env.MAIL_USERNAME}>`,
            to,
            subject,
            text,
            html
        });
        console.log("✅ Mail sent:", info.messageId);
    } catch (err) {
        console.error("⚠️ Mail Error during send:", err.message);
    }
};

module.exports = {
    sendVerificationEmail,
    sendEmail
}