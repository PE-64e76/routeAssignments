import nodemailer from "nodemailer";
import { APP_EMAIL, APP_EMAIL_PASSWORD, APPLICATION_NAME } from "../../../config/config.service";
import Mail from "nodemailer/lib/mailer";

export const sendEmail = async ({
  to,
  cc,
  bcc,
  subject,
  html,
  attachments = []
}:Mail.Options = {}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: APP_EMAIL,
      pass: APP_EMAIL_PASSWORD
    },
  });

  const info = await transporter.sendMail({
    to,
    cc,
    bcc,
    subject,
    attachments,
    html,
    from: `"${APPLICATION_NAME}" <${APP_EMAIL}>'`,
  });

  console.log("Message sent:", info.messageId);
};