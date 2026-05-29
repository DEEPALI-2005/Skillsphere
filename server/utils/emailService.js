const nodemailer = require('nodemailer');

// Transporter banao
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Welcome Email
const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      user.email,
      subject: '🎉 Welcome to SkillSphere!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to SkillSphere! 🚀</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Hello ${user.name}! 👋</h2>
            <p style="color: #6b7280;">Tumhara account successfully ban gaya hai!</p>
            <p style="color: #6b7280;">Tum ab SkillSphere pe:</p>
            <ul style="color: #6b7280;">
              ${user.role === 'client'
                ? '<li>Projects post kar sakte ho</li><li>Best freelancers dhundh sakte ho</li>'
                : '<li>Apna profile banao</li><li>Projects pe apply karo</li><li>Paise kamao</li>'
              }
            </ul>
            <a href="http://localhost:5173/dashboard"
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
              Dashboard Pe Jao →
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              SkillSphere Team ❤️
            </p>
          </div>
        </div>
      `
    });
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Email send nahi hua:', error.message);
  }
};

// Proposal Accept Email
const sendProposalAcceptEmail = async (freelancer, gig) => {
  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      freelancer.email,
      subject: '🎊 Tumhara Proposal Accept Ho Gaya!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Proposal Accept! 🎊</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Congratulations ${freelancer.name}!</h2>
            <p style="color: #6b7280;">Tumhara proposal <strong>${gig.title}</strong> ke liye accept ho gaya!</p>
            <p style="color: #6b7280;">Ab client se contact karo aur kaam shuru karo!</p>
            <a href="http://localhost:5173/dashboard"
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
              Dashboard Pe Jao →
            </a>
          </div>
        </div>
      `
    });
    console.log(`Proposal accept email sent to ${freelancer.email}`);
  } catch (error) {
    console.error('Email send nahi hua:', error.message);
  }
};

// Payment Release Email
const sendPaymentEmail = async (freelancer, amount) => {
  try {
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      freelancer.email,
      subject: '💰 Payment Release Ho Gaya!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Payment Received! 💰</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Hello ${freelancer.name}!</h2>
            <p style="color: #6b7280;">Tumhare account mein <strong style="color: #10b981; font-size: 24px;">₹${amount}</strong> release ho gaya!</p>
            <p style="color: #6b7280;">Badiya kaam kiya! 🎉</p>
            <a href="http://localhost:5173/dashboard"
               style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
              Dashboard Pe Jao →
            </a>
          </div>
        </div>
      `
    });
    console.log(`Payment email sent to ${freelancer.email}`);
  } catch (error) {
    console.error('Email send nahi hua:', error.message);
  }
};

// Password Reset Email
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      user.email,
      subject: '🔐 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Password Reset 🔐</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Hello ${user.name}!</h2>
            <p style="color: #6b7280;">Tumne password reset request ki hai.</p>
            <p style="color: #6b7280;">Neeche button click karo — yeh link 10 minute mein expire ho jayega!</p>
            <a href="${resetUrl}"
               style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
              Password Reset Karo →
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              Agar tumne yeh request nahi ki toh ignore karo!
            </p>
          </div>
        </div>
      `
    });
    console.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('Email send nahi hua:', error.message);
  }
};
// Email Verification
const sendVerificationEmail = async (user, verifyToken) => {
  try {
    const verifyUrl = `http://localhost:5173/verify-email/${verifyToken}`;
    await transporter.sendMail({
      from:    process.env.EMAIL_FROM,
      to:      user.email,
      subject: '✅ SkillSphere — Email Verify Karo!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Email Verify Karo! ✅</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937;">Hello ${user.name}! 👋</h2>
            <p style="color: #6b7280;">Account activate karne ke liye neeche button click karo:</p>
            <a href="${verifyUrl}"
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">
              ✅ Email Verify Karo
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
              Yeh link 24 ghante mein expire ho jayega!
            </p>
          </div>
        </div>
      `
    });
    console.log(`Verification email sent to ${user.email}`);
  } catch (error) {
    console.error('Email send nahi hua:', error.message);
  }
};
module.exports = {
  sendWelcomeEmail,
  sendProposalAcceptEmail,
  sendPaymentEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};