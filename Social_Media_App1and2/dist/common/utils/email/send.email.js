"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_service_1 = require("../../../config/config.service");
const sendEmail = async ({ to, cc, bcc, subject, html, attachments = [] } = {}) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_service_1.APP_EMAIL,
            pass: config_service_1.APP_EMAIL_PASSWORD
        },
    });
    const info = await transporter.sendMail({
        to,
        cc,
        bcc,
        subject,
        attachments,
        html,
        from: `"${config_service_1.APPLICATION_NAME}" <${config_service_1.APP_EMAIL}>'`,
    });
    console.log("Message sent:", info.messageId);
};
exports.sendEmail = sendEmail;
