const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter;

const initializeTransporter = async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Initializing development email transporter...");

    // For development, use Gmail SMTP but with test account
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.EMAIL_DEBUG === "true",
      logger: process.env.EMAIL_DEBUG === "true",
    });
  } else {
    // For production
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      debug: process.env.EMAIL_DEBUG === "true",
      logger: process.env.EMAIL_DEBUG === "true",
    });
  }
};

// Initialize transporter
initializeTransporter()
  .then((trans) => {
    transporter = trans;
    console.log("Email transporter initialized successfully");

    // Verify connection configuration
    transporter.verify(function (error, success) {
      if (error) {
        console.error("Error with email configuration:", error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });
  })
  .catch((error) => {
    console.error("Failed to initialize email transporter:", error);
  });

/**
 * Send an email with HTML content
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content of the email
 * @param {string} [options.text] - Plain text version of the email (optional)
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.error("Email transporter not initialized");
    throw new Error("Email service is not available");
  }

  const mailOptions = {
    from: `"Sarayu IT Team App" <${
      process.env.EMAIL_FROM || process.env.EMAIL_USER
    }>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""), // Convert HTML to plain text if text not provided
  };

  try {
    console.log("Sending email to:", to);
    console.log("Subject:", subject);

    const info = await transporter.sendMail(mailOptions);

    // Log the preview URL when in development
    if (process.env.NODE_ENV === "development") {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Generate password reset email template
 * @param {string} name - User's name
 * @param {string} resetUrl - Password reset URL
 * @returns {Object} Email template with subject, html and text content
 */
const getPasswordResetTemplate = (name, resetUrl) => {
  return {
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <p style="margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Sarayu IT Team App Team</p>
      </div>
    `,
    text: `
      Password Reset Request
      ---------------------
      
      Hello ${name},
      
      You requested to reset your password. Click the link below to set a new password:
      ${resetUrl}
      
      Or copy and paste this link into your browser:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      Sarayu IT Team App Team
    `,
  };
};

// Export both functions
module.exports = {
  sendMail,
  getPasswordResetTemplate,
};
