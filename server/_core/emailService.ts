import { ENV } from "./env";
import nodemailer from "nodemailer";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize Gmail transporter with App Password
 */
function getTransporter(): nodemailer.Transporter | null {
  if (transporter) {
    return transporter;
  }

  if (!ENV.gmailAppPassword || !ENV.contactFormEmail) {
    console.error("[Email] Gmail credentials not configured");
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: ENV.contactFormEmail,
        pass: ENV.gmailAppPassword,
      },
    });
    console.log("[Email] Gmail transporter initialized");
    return transporter;
  } catch (error) {
    console.error("[Email] Failed to initialize Gmail transporter:", error);
    return null;
  }
}

/**
 * Send an email using Gmail SMTP
 * @param payload Email data including recipient, subject, and content
 * @returns true if email was sent successfully, false otherwise
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.error("[Email] Email service not configured");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: ENV.contactFormEmail,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || payload.html,
    });

    console.log(`[Email] Successfully sent email to ${payload.to}. Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Send contact form notification email
 * @param contactData Contact form submission data
 * @returns true if email was sent successfully
 */
export async function sendContactFormEmail(contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const adminEmail = ENV.contactFormEmail;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">New Contact Form Submission</h2>
      </div>

      <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 8px;">From:</h3>
          <p style="color: #6b7280; margin: 0;">
            <strong>${escapeHtml(contactData.name)}</strong><br />
            <a href="mailto:${escapeHtml(contactData.email)}" style="color: #0ea5e9; text-decoration: none;">
              ${escapeHtml(contactData.email)}
            </a>
          </p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 8px;">Subject:</h3>
          <p style="color: #6b7280; margin: 0;">${escapeHtml(contactData.subject)}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #374151; margin-bottom: 8px;">Message:</h3>
          <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 4px;">
            <p style="color: #6b7280; margin: 0; white-space: pre-wrap;">
              ${escapeHtml(contactData.message)}
            </p>
          </div>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This email was sent from the Hospital AI Assistant Contact Form.
            <br />
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Contact Form: ${contactData.subject}`,
    html: htmlContent,
    text: `New Contact Form Submission\n\nFrom: ${contactData.name} (${contactData.email})\nSubject: ${contactData.subject}\n\nMessage:\n${contactData.message}`,
  });
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
