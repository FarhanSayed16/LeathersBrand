import nodemailer from 'nodemailer';
import brand from '../../shared/brand.config.js';

function assertSmtpConfig() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`SMTP not configured. Missing: ${missing.join(', ')}`);
  }
}

function createTransporter() {
  assertSmtpConfig();
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send a generic email.
 * @param {string} to      Recipient email
 * @param {string} subject Email subject
 * @param {string} html    HTML body
 */
export async function sendEmail({ to, subject, html }) {
  if (!to) throw new Error('No recipient specified');
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: `"${brand.email?.fromName || 'Afiya Leathers'}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
  console.log('Email sent:', info.messageId);
  return info;
}
