const getPasswordResetTemplate = (name, resetUrl) => ({
  subject: "Password Reset Request",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                  color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have questions.</p>
      <p>This link will expire in 10 minutes.</p>
      <p>Best regards,<br>Your Sarayu IT Team Team</p>
    </div>
  `,
  text: `
    Hello ${name},

    We received a request to reset your password. Please use the following link to reset your password:

    ${resetUrl}

    If you didn't request a password reset, please ignore this email or contact support if you have questions.

    This link will expire in 10 minutes.

    Best regards,
    Your Sarayu IT Team Team
  `,
});

module.exports = {
  getPasswordResetTemplate,
};
