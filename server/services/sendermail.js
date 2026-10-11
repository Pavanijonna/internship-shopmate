const nodeMailer = require('nodemailer');
require('dotenv').config();

const mailUser = process.env.MAIL_USERNAME;
const mailPass = process.env.MAIL_PASSWORD;
const mailHost = process.env.MAIL_SERVER || 'smtp.gmail.com';
const mailPort = Number(process.env.MAIL_PORT) || 587;

let transporter = null;
let isSmtpReady = false;

if (mailUser && mailPass && !mailPass.includes('your_app_password')) {
    const isGmail = mailHost.includes('gmail');
    transporter = nodeMailer.createTransport(
        isGmail
            ? {
                  service: 'gmail',
                  auth: {
                      user: mailUser,
                      pass: mailPass,
                  },
                  tls: { rejectUnauthorized: false },
              }
            : {
                  host: mailHost,
                  port: mailPort,
                  secure: mailPort === 465,
                  auth: {
                      user: mailUser,
                      pass: mailPass,
                  },
                  tls: { rejectUnauthorized: false },
              }
    );

    transporter.verify((error, success) => {
        if (error) {
            console.log("ℹ️  SMTP auth failed (Invalid or expired Gmail App Password). Console logging fallback enabled.");
            isSmtpReady = false;
        } else {
            console.log("✅ SMTP Server Connected & Ready!");
            isSmtpReady = true;
        }
    });
} else {
    console.log("ℹ️  SMTP credentials not set. Console logging fallback enabled for emails.");
}

const sendVerificationEmail = async (email, name, token) => {
    try {
        const verificationLink =
            `${process.env.SERVER_URL || 'https://internship-shopmate-backend.onrender.com'}/api/users/verify-email/${token}`;

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