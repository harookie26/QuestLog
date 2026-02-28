import nodemailer from 'nodemailer';

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return String(value).toLowerCase() === 'true';
}

function getTransportConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBoolean(process.env.SMTP_SECURE, false);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass }
  };
}

export async function sendSignupOtpEmail({ toEmail, otpCode, expiresMinutes = 10 }) {
  const transportConfig = getTransportConfig();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';

  const subject = 'Your account verification code';
  const text = `Your verification code is ${otpCode}. It expires in ${expiresMinutes} minutes.`;
  const html = `<p>Your verification code is <strong style="font-size:1.2em;">${otpCode}</strong>.</p><p>This code expires in ${expiresMinutes} minutes.</p>`;

  if (!transportConfig) {
    console.warn('SMTP not configured. OTP email not sent.');
    return {
      delivered: false,
      reason: 'smtp-not-configured'
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);
  await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html
  });

  return { delivered: true };
}

export async function sendPasswordResetOtpEmail({ toEmail, otpCode, expiresMinutes = 10 }) {
  const transportConfig = getTransportConfig();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';

  const subject = 'Your password reset code';
  const text = `Your password reset code is ${otpCode}. It expires in ${expiresMinutes} minutes.`;
  const html = `<p>Your password reset code is <strong style="font-size:1.2em;">${otpCode}</strong>.</p><p>This code expires in ${expiresMinutes} minutes.</p>`;

  if (!transportConfig) {
    console.warn('SMTP not configured. Password reset OTP email not sent.');
    return {
      delivered: false,
      reason: 'smtp-not-configured'
    };
  }

  const transporter = nodemailer.createTransport(transportConfig);
  await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html
  });

  return { delivered: true };
}
