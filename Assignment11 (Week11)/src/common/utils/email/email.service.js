import nodemailer from "nodemailer";
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from "../../../../config/config.service.js";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: parseInt(EMAIL_PORT),
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html } = {}) => {
  const transporter = createTransporter();
  return await transporter.sendMail({
    from: `"Saraha App" <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendOTPEmail = async ({ to, otp } = {}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
      <p>This code is valid for <strong>5 minutes</strong> only.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
  return await sendEmail({ to, subject: "Saraha - Email Verification Code", html });
};
