/**
 * Email Service
 * Handles transactional email notifications, including password reset links.
 */
import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async (toEmail, resetUrl) => {
  const isSmtpConfigured = Boolean(
    (process.env.SMTP_HOST || process.env.SMTP_SERVICE) &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (!isSmtpConfigured) {
    console.log("==================================================");
    console.log("📧 [Email Service - Development Notice]");
    console.log(`To: ${toEmail}`);
    console.log(`Subject: Password Reset Request for CareerOS`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("==================================================");
    console.log("ℹ️  To deliver real emails to inboxes, add SMTP credentials to apps/backend/.env:");
    console.log("   Option A (Gmail): SMTP_SERVICE=gmail, SMTP_USER=you@gmail.com, SMTP_PASS=app_password");
    console.log("   Option B (Custom SMTP): SMTP_HOST=..., SMTP_PORT=587, SMTP_USER=..., SMTP_PASS=...");
    console.log("==================================================");
    return { delivered: false, simulated: true, resetUrl };
  }

  try {
    const transportConfig = process.env.SMTP_SERVICE
      ? {
          service: process.env.SMTP_SERVICE,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        }
      : {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"CareerOS" <${process.env.SMTP_USER}>`,
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

    console.log(`✅ Password reset email successfully dispatched to ${toEmail}`);
    return { delivered: true, simulated: false, resetUrl };
  } catch (error) {
    console.error("❌ Failed to send password reset email via SMTP:", error.message);
    return { delivered: false, simulated: false, error: error.message, resetUrl };
  }
};

export default {
  sendPasswordResetEmail,
};
