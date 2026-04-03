import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendFraudAlertEmail = async (to, alertData) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `🚨 FRAUD ALERT: Suspicious Activity Detected (${alertData.accountId})`,
      html: `
        <h2>GraphSentinel AI Fraud Alert</h2>
        <p><strong>Account:</strong> ${alertData.accountId}</p>
        <p><strong>Risk Score:</strong> ${alertData.riskScore}%</p>
        <p><strong>Status:</strong> ${alertData.status || 'open'}</p>
        <p><strong>Details:</strong> Suspicious activity has been flagged on your account.</p>
        <p>Please contact support immediately or verify this activity.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
