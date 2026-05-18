import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASSWORD, EMAIL_SERVICE } from '../../../../config/config.service.js';

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: EMAIL_SERVICE ?? 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendOTPEmail = async (email, otp) => {
  const subject = 'Verify your email - Saraha App';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Thank you for signing up! Please use the following OTP to verify your email:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4CAF50; margin: 0; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">Saraha App</p>
    </div>
  `;
  
  return await sendEmail({ to: email, subject, html });
};
