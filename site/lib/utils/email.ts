import nodemailer from "nodemailer";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@atria.com";
const PLATFORM_NAME = process.env.PLATFORM_NAME || "Atria";
const FRONTEND_URL =
  (process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_PROD_URL
    : process.env.FRONTEND_DEV_URL) || "http://localhost:3000";
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
// Email templates
const getEmailTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .success {
            background-color: #d1fae5;
            border: 1px solid #10b981;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>${PLATFORM_NAME}</h1>
        </div>
        ${content}
        <div class="footer">
            <p>This is an automated message from ${PLATFORM_NAME}. Please do not reply to this email.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;
export async function sendVerificationEmail(
  email: string,
  token: string,
  userName: string,
): Promise<void> {
  const verificationLink = `${FRONTEND_URL}/auth/verify-email?token=${token}`;

  const content = `
    <h2>Welcome to ${PLATFORM_NAME}!</h2>
    <p>Hi ${escapeHtml(userName)},</p>
    <p>Thank you for signing up! Please click the button below to verify your email address:</p>
    <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify Email Address</a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #2563eb;">${verificationLink}</p>
    <div class="warning">
        <p><strong>Security Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Verify your email - ${PLATFORM_NAME}`,
    html: getEmailTemplate(content, "Email Verification"),
  });
}
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userName: string,
): Promise<void> {
  const resetLink = `${FRONTEND_URL}/auth/reset-password?token=${token}`;

  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${escapeHtml(userName)},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="word-break: break-all; color: #2563eb;">${resetLink}</p>
    <div class="warning">
        <p><strong>Security Note:</strong> This reset link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Password Reset - ${PLATFORM_NAME}`,
    html: getEmailTemplate(content, "Password Reset"),
  });
}

// Send agency approval email
export async function sendAgencyApprovalEmail(
  email: string,
  companyName: string,
): Promise<void> {
  const loginLink = `${FRONTEND_URL}/auth/login`;

  const content = `
    <h2>Agency Application Approved! 🎉</h2>
    <p>Dear ${escapeHtml(companyName)} Team,</p>
    <p>Congratulations! Your agency application has been approved and your account is now active.</p>
    
    <div class="success">
        <p><strong>Your agency account is now ready to use!</strong></p>
        <p>You can now:</p>
        <ul>
            <li>List properties on our platform</li>
            <li>Manage your property portfolio</li>
            <li>Access advanced analytics and reporting</li>
            <li>Connect with potential investors</li>
        </ul>
    </div>
    
    <div style="text-align: center;">
        <a href="${loginLink}" class="button">Sign In to Your Account</a>
    </div>
    
    <p>Next steps:</p>
    <ol>
        <li>Complete your agency profile</li>
        <li>Upload your first property listing</li>
        <li>Set up your payment and banking details</li>
    </ol>
    
    <p>If you need any assistance getting started, our support team is here to help!</p>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Agency Account Approved - ${PLATFORM_NAME}`,
    html: getEmailTemplate(content, "Agency Approval"),
  });
}

// Send agency rejection email
export async function sendAgencyRejectionEmail(
  email: string,
  companyName: string,
  rejectionReason: string,
): Promise<void> {
  const content = `
    <h2>Agency Application Update</h2>
    <p>Dear ${escapeHtml(companyName)} Team,</p>
    <p>Thank you for your interest in joining ${PLATFORM_NAME}. After careful review of your application, we are unable to approve your agency account at this time.</p>
    
    <div class="warning">
        <p><strong>Reason for rejection:</strong></p>
        <p>${escapeHtml(rejectionReason)}</p>
    </div>
    
    <p>We encourage you to address these concerns and reapply in the future. Our requirements help ensure the highest quality of service for all users on our platform.</p>
    
    <p>If you have any questions about this decision or need clarification on our requirements, please don't hesitate to contact our support team.</p>
    
    <p>Thank you for your understanding.</p>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Agency Application Update - ${PLATFORM_NAME}`,
    html: getEmailTemplate(content, "Agency Application Update"),
  });
}

// Send account suspension email
export async function sendAccountSuspensionEmail(
  email: string,
  userName: string,
  reason: string,
): Promise<void> {
  const content = `
    <h2>Account Suspension Notice</h2>
    <p>Dear ${escapeHtml(userName)},</p>
    <p>We regret to inform you that your account has been temporarily suspended.</p>
    
    <div class="warning">
        <p><strong>Reason for suspension:</strong></p>
        <p>${escapeHtml(reason)}</p>
    </div>
    
    <p>During this suspension period, you will not be able to access your account or use our platform services.</p>
    
    <p>If you believe this suspension is in error or if you would like to discuss this matter, please contact our support team immediately.</p>
    
    <p>We take these actions seriously and only when necessary to maintain the integrity and security of our platform.</p>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Account Suspension Notice - ${PLATFORM_NAME}`,
    html: getEmailTemplate(content, "Account Suspension"),
  });
}

// Send welcome email for investors
export async function sendInvestorWelcomeEmail(
  email: string,
  firstName: string,
): Promise<void> {
  const loginLink = `${FRONTEND_URL}/auth/login`;
  const kycLink = `${FRONTEND_URL}/investor/kyc`;

  const content = `
    <h2>Welcome to ${PLATFORM_NAME}! 🏠</h2>
    <p>Hi ${escapeHtml(firstName)},</p>
    <p>Welcome to the future of real estate investing! Your investor account has been successfully created.</p>

    <div class="success">
        <p><strong>You're now ready to explore tokenized real estate investments!</strong></p>
        <p>With your account, you can:</p>
        <ul>
            <li>Browse and invest in fractional real estate properties</li>
            <li>Track your investment portfolio</li>
            <li>Receive dividends from your property investments</li>
            <li>Trade property tokens with other investors</li>
        </ul>
    </div>
    
    <div style="text-align: center;">
        <a href="${loginLink}" class="button">Sign In to Your Account</a>
    </div>
    
    <p><strong>Important Next Steps:</strong></p>
    <ol>
        <li>Complete your KYC (Know Your Customer) verification</li>
        <li>Set up your investment preferences</li>
        <li>Fund your account to start investing</li>
        <li>Browse available properties</li>
    </ol>
    
    <div style="text-align: center; margin: 20px 0;">
        <a href="${kycLink}" class="button" style="background-color: #059669;">Complete KYC Verification</a>
    </div>
    
    <p>Have questions? Our support team is here to help you every step of the way!</p>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `Welcome to ${PLATFORM_NAME} - Start Your Real Estate Investment Journey!`,
    html: getEmailTemplate(content, "Welcome to Platform"),
  });
}

// Send KYC completion notification
export async function sendKYCCompletionEmail(
  email: string,
  firstName: string,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  const loginLink = `${FRONTEND_URL}/auth/login`;

  let content: string;

  if (status === "APPROVED") {
    content = `
      <h2>KYC Verification Approved! ✅</h2>
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Great news! Your KYC (Know Your Customer) verification has been approved.</p>
      
      <div class="success">
        <p><strong>Your account is now fully verified and ready for investing!</strong></p>
        <p>You can now:</p>
        <ul>
            <li>Invest in any property on our platform</li>
            <li>Make deposits and withdrawals</li>
            <li>Access premium features</li>
            <li>Participate in exclusive investment opportunities</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
          <a href="${loginLink}" class="button">Start Investing Now</a>
      </div>
    `;
  } else {
    content = `
      <h2>KYC Verification Update</h2>
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>We've reviewed your KYC (Know Your Customer) documentation and unfortunately cannot approve it at this time.</p>
      
      <div class="warning">
        <p><strong>Common reasons for rejection:</strong></p>
        <ul>
            <li>Documents are unclear or incomplete</li>
            <li>Information doesn't match across documents</li>
            <li>Documents are expired or invalid</li>
            <li>Additional verification required</li>
        </ul>
      </div>
      
      <p>Don't worry - you can resubmit your KYC documents at any time through your account dashboard.</p>
      
      <div style="text-align: center;">
          <a href="${loginLink}" class="button">Resubmit KYC Documents</a>
      </div>
    `;
  }

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: `KYC Verification ${status === "APPROVED" ? "Approved" : "Update"} - ${PLATFORM_NAME}`,
    html: getEmailTemplate(content, "KYC Verification"),
  });
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error) {
    console.error("Email configuration error:", error);
    return false;
  }
}
