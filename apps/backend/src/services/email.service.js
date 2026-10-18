/**
 * Email Service
 * Handles transactional email notifications, including password reset links.
 * Supports Gmail (App Passwords) and custom SMTP providers with STARTTLS.
 */
import nodemailer from "nodemailer";

/**
 * Clean and format SMTP credentials securely.
 * Strips formatting spaces from Google App Passwords (e.g. 'xxxx xxxx xxxx xxxx' -> 'xxxxxxxxxxxxxxxx').
 */
const getCleanSmtpConfig = () => {
  const service = process.env.SMTP_SERVICE?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  // Strip spaces often present in Google App Passwords
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim().replace(/\s+/g, "") : "";
  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465;

  const isConfigured = Boolean((host || service) && user && pass);

  return {
    isConfigured,
    service,
    host,
    port,
    isSecure,
    user,
    pass,
    from: process.env.EMAIL_FROM?.trim() || (user ? `"CareerOS" <${user}>` : '"CareerOS" <no-reply@careeros.app>'),
  };
};

/**
 * Creates a Nodemailer transport instance based on active configuration.
 */
export const createSmtpTransport = () => {
  const config = getCleanSmtpConfig();

  if (!config.isConfigured) {
    return null;
  }

  if (config.service) {
    return nodemailer.createTransport({
      service: config.service,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.isSecure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });
};

/**
 * Diagnostics helper: verifies SMTP connection without sending an email.
 * Never logs or exposes credentials.
 */
export const verifySmtpConnection = async () => {
  const config = getCleanSmtpConfig();
  if (!config.isConfigured) {
    return {
      configured: false,
      message: "SMTP is not configured (SMTP_USER / SMTP_PASS missing). Running in development simulation mode.",
    };
  }

  try {
    const transporter = createSmtpTransport();
    await transporter.verify();
    return {
      configured: true,
      verified: true,
      message: `SMTP connection established successfully (${config.service || config.host}:${config.port}).`,
    };
  } catch (error) {
    return {
      configured: true,
      verified: false,
      error: error.message,
      isAuthError: error.message?.includes("535") || error.message?.toLowerCase().includes("badcredentials"),
    };
  }
};

/**
 * Dispatches a password reset email via configured SMTP, or falls back to console in development.
 */
export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const config = getCleanSmtpConfig();

  if (!config.isConfigured) {
    console.log("==================================================");
    console.log("📧 [Email Service - Development Notice]");
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Password Reset Request for CareerOS`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("==================================================");
    console.log("ℹ️  SMTP is not configured in apps/backend/.env.");
    console.log("   Option A (Gmail): SMTP_SERVICE=gmail, SMTP_USER=you@gmail.com, SMTP_PASS=app_password");
    console.log("   Option B (Custom SMTP): SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER=..., SMTP_PASS=...");
    console.log("==================================================");
    return { delivered: false, simulated: true, configured: false, resetUrl };
  }

  try {
    const transporter = createSmtpTransport();

    await transporter.sendMail({
      from: config.from,
      to: toEmail,
      subject: "Reset your CareerOS password",
      text: `Hello,\n\nYou requested a password reset for your CareerOS account.\nPlease click the link below or paste it into your browser to set a new password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\nIf you did not make this request, please ignore this email.\n\nBest,\nThe CareerOS Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="margin-bottom: 24px;">
            <span style="font-size: 20px; font-weight: 700; color: #4f46e5;">CareerOS</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 12px;">Reset your password</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your password for your CareerOS account. Click the button below to set a new password:
          </p>
          <div style="text-align: left; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            This link is valid for 15 minutes. If you did not request this password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    console.log(`✅ [Email Service] Password reset email successfully dispatched to ${toEmail}`);
    return { delivered: true, simulated: false, configured: true, resetUrl };
  } catch (error) {
    console.error("❌ [Email Service] Failed to send password reset email via SMTP:", error.message);
    if (error.message?.includes("535") || error.message?.toLowerCase().includes("badcredentials")) {
      console.error("💡 [Email Service Diagnostic] Google rejected credentials (535 BadCredentials).");
      console.error("   Ensure 2-Step Verification is active on this Google Account and use a 16-character App Password from https://myaccount.google.com/apppasswords.");
    }

    return {
      delivered: false,
      simulated: false,
      configured: true,
      error: error.message,
      resetUrl,
    };
  }
};

export default {
  createSmtpTransport,
  verifySmtpConnection,
  sendPasswordResetEmail,
};
