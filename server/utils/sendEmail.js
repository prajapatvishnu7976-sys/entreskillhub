// ============================================
// EntreSkillHub - Email Sending Utility
// Nodemailer configuration and email templates
// ============================================

const nodemailer = require('nodemailer');

// ============================================
// Create Transporter
// ============================================
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

// ============================================
// Verify Transporter Connection
// ============================================
exports.verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    return false;
  }
};

// ============================================
// Base HTML Template Wrapper
// ============================================
const wrapInTemplate = (content, title = 'EntreSkillHub') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f7fa;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      letter-spacing: -1px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #2d3748;
      font-size: 22px;
      margin-bottom: 16px;
    }
    .content p {
      color: #4a5568;
      margin-bottom: 16px;
      font-size: 15px;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
    .info-box {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background: #fff5f5;
      border-left: 4px solid #e53e3e;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
      color: #742a2a;
    }
    .success-box {
      background: #f0fff4;
      border-left: 4px solid #48bb78;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f7fafc;
      padding: 30px;
      text-align: center;
      color: #718096;
      font-size: 13px;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
      margin: 0 8px;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 24px 0;
    }
    .code-box {
      background: #f7fafc;
      border: 2px dashed #cbd5e0;
      padding: 20px;
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #667eea;
      border-radius: 8px;
      margin: 20px 0;
    }
    @media (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .header, .content { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🚀 EntreSkillHub</div>
      <p>Skill to Startup Enablement Platform</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>EntreSkillHub</strong> - Empowering Micro Entrepreneurs</p>
      <div class="divider"></div>
      <p>
        <a href="${process.env.CLIENT_URL}">Home</a> |
        <a href="${process.env.CLIENT_URL}/about">About</a> |
        <a href="${process.env.CLIENT_URL}/contact">Contact</a> |
        <a href="${process.env.CLIENT_URL}/privacy">Privacy</a>
      </p>
      <p style="margin-top: 12px;">
        &copy; ${new Date().getFullYear()} EntreSkillHub. All rights reserved.
      </p>
      <p style="margin-top: 8px; font-size: 11px;">
        You received this email because you're a member of EntreSkillHub.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// ============================================
// Main Send Email Function
// ============================================
exports.sendEmail = async (options) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  SMTP credentials not configured. Email not sent.');
      console.log('📧 Would send email to:', options.email);
      console.log('📧 Subject:', options.subject);
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'EntreSkillHub'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.text || options.message,
      html: options.html || wrapInTemplate(options.message, options.subject),
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent to ${options.email} | Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Welcome Email
 */
exports.sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to EntreSkillHub, ${user.name}! 🎉</h2>
    <p>We're thrilled to have you join our community of aspiring entrepreneurs!</p>
    <p>EntreSkillHub is designed to help you transform your skills into successful micro-businesses. Here's what you can do next:</p>

    <div class="info-box">
      <strong>🎯 Your Journey Starts Here:</strong>
      <ul style="margin-top: 8px; padding-left: 20px;">
        <li>Complete your skill assessment</li>
        <li>Discover business ideas matched to your skills</li>
        <li>Access step-by-step business roadmaps</li>
        <li>Connect with expert mentors</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">Get Started →</a>
    </div>

    <p>If you have any questions, our team is here to help. Just reply to this email!</p>
    <p>Wishing you great success on your entrepreneurial journey! 🚀</p>
    <p><strong>The EntreSkillHub Team</strong></p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: '🎉 Welcome to EntreSkillHub - Start Your Entrepreneurial Journey!',
    html: wrapInTemplate(content, 'Welcome to EntreSkillHub'),
  });
};

/**
 * Email Verification
 */
exports.sendVerificationEmail = async (user, verificationToken) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hi ${user.name},</p>
    <p>Thank you for registering with EntreSkillHub! Please verify your email address to activate your account.</p>

    <div style="text-align: center;">
      <a href="${verifyUrl}" class="btn">Verify Email Address</a>
    </div>

    <div class="info-box">
      <strong>ℹ️ Note:</strong> This verification link will expire in <strong>24 hours</strong>.
    </div>

    <p>Or copy this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 13px;">${verifyUrl}</p>

    <div class="divider"></div>
    <p style="font-size: 13px; color: #718096;">
      If you didn't create an account with EntreSkillHub, please ignore this email.
    </p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: 'Verify Your Email - EntreSkillHub',
    html: wrapInTemplate(content, 'Verify Email'),
  });
};

/**
 * Password Reset Email
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const content = `
    <h2>Reset Your Password 🔐</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>

    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>

    <div class="warning-box">
      <strong>⚠️ Security Notice:</strong>
      <ul style="margin-top: 8px; padding-left: 20px;">
        <li>This link will expire in <strong>10 minutes</strong></li>
        <li>Only use this link if you requested a password reset</li>
        <li>Never share this link with anyone</li>
      </ul>
    </div>

    <p>Or copy this link into your browser:</p>
    <p style="word-break: break-all; color: #667eea; font-size: 13px;">${resetUrl}</p>

    <div class="divider"></div>
    <p style="font-size: 13px; color: #718096;">
      If you didn't request a password reset, please ignore this email or contact support immediately.
    </p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: '🔐 Password Reset Request - EntreSkillHub',
    html: wrapInTemplate(content, 'Password Reset'),
  });
};

/**
 * Session Booking Confirmation
 */
exports.sendSessionConfirmation = async (user, session, mentor) => {
  const content = `
    <h2>Session Booked Successfully! ✅</h2>
    <p>Hi ${user.name},</p>
    <p>Your mentoring session has been confirmed. Here are the details:</p>

    <div class="success-box">
      <strong>📅 Session Details:</strong>
      <ul style="margin-top: 8px; padding-left: 20px; list-style: none;">
        <li>📌 <strong>Topic:</strong> ${session.title}</li>
        <li>👨‍🏫 <strong>Mentor:</strong> ${mentor.name}</li>
        <li>📆 <strong>Date:</strong> ${new Date(session.scheduledDate).toLocaleDateString()}</li>
        <li>⏰ <strong>Time:</strong> ${session.startTime} - ${session.endTime}</li>
        <li>⏱️ <strong>Duration:</strong> ${session.duration} minutes</li>
        <li>💻 <strong>Mode:</strong> ${session.mode}</li>
      </ul>
    </div>

    ${session.meetingDetails?.meetingLink ? `
      <div style="text-align: center;">
        <a href="${session.meetingDetails.meetingLink}" class="btn">Join Session</a>
      </div>
    ` : ''}

    <p><strong>What to prepare:</strong></p>
    <ul style="padding-left: 20px;">
      <li>Note down your specific questions</li>
      <li>Test your camera and microphone beforehand</li>
      <li>Join 5 minutes early</li>
    </ul>

    <p>Good luck with your session! 🎯</p>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: `✅ Session Confirmed - ${session.title}`,
    html: wrapInTemplate(content, 'Session Confirmation'),
  });
};

/**
 * Milestone Achievement Email
 */
exports.sendMilestoneEmail = async (user, milestone) => {
  const content = `
    <h2>Congratulations! You've Achieved a Milestone! 🏆</h2>
    <p>Hi ${user.name},</p>
    <p>Amazing work! You've just achieved:</p>

    <div class="success-box" style="text-align: center;">
      <div style="font-size: 60px; margin-bottom: 10px;">${milestone.icon || '🎯'}</div>
      <h3 style="color: #48bb78; margin: 10px 0;">${milestone.title}</h3>
      <p>${milestone.description}</p>
    </div>

    <p>Keep up the fantastic work! Every step brings you closer to your entrepreneurial dreams.</p>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL}/dashboard" class="btn">View Your Progress</a>
    </div>
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: `🏆 Milestone Achieved: ${milestone.title}`,
    html: wrapInTemplate(content, 'Milestone Achievement'),
  });
};

/**
 * Custom Notification Email
 */
exports.sendNotificationEmail = async (user, notification) => {
  const content = `
    <h2>${notification.title}</h2>
    <p>Hi ${user.name},</p>
    <p>${notification.message}</p>

    ${notification.actionUrl ? `
      <div style="text-align: center;">
        <a href="${notification.actionUrl}" class="btn">${notification.actionText || 'View Details'}</a>
      </div>
    ` : ''}
  `;

  return await exports.sendEmail({
    email: user.email,
    subject: notification.title,
    html: wrapInTemplate(content, notification.title),
  });
};

/**
 * OTP Email
 */
exports.sendOTPEmail 