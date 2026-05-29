const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
} = require('../utils/emailService');
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Yeh email pehle se registered hai!'
      });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client'
    });
    const token = generateToken(res, user._id);
    // Welcome email bhejo
    sendWelcomeEmail(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
// Verification email bhejo
const verifyToken = crypto.randomBytes(32).toString('hex');
user.emailVerifyToken  = crypto.createHash('sha256').update(verifyToken).digest('hex');
user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
await user.save();
sendVerificationEmail(user, verifyToken);
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email aur password dono daalo!'
      });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ya password galat hai!'
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ya password galat hai!'
      });
    }
    const token = generateToken(res, user._id);

    res.json({
      success: true,
      message: 'Login successful!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });

  } catch (error) {
    next(error);
  }
};
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
const logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({
    success: true,
    message: 'Logout successful!'
  });
};
// @POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Yeh email registered nahi hai!'
      });
    }

    // Reset token banao
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Email bhejo
    await sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'Password reset email bhej diya!'
    });

  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalid ya expire ho gaya!'
      });
    }

    user.password            = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset ho gaya! Ab login karo.'
    });

  } catch (error) {
    next(error);
  }
};
// @GET /api/auth/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const emailVerifyToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      emailVerifyToken,
      emailVerifyExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalid ya expire ho gaya!'
      });
    }

    user.isVerified       = true;
    user.emailVerifyToken  = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verify ho gaya! ✅' });

  } catch (error) {
    next(error);
  }
};

// @POST /api/auth/resend-verification
const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email pehle se verified hai!'
      });
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    user.emailVerifyToken  = crypto.createHash('sha256').update(verifyToken).digest('hex');
    user.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    sendVerificationEmail(user, verifyToken);

    res.json({ success: true, message: 'Verification email bhej diya!' });

  } catch (error) {
    next(error);
  }
};
module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};