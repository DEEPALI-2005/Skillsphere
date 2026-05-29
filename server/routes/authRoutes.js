const express  = require('express');
const router   = express.Router();
const passport = require('../config/passport');
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
} = require('../controllers/authController');
const { protect }       = require('../middleware/authMiddleware');
const generateToken     = require('../utils/generateToken');

router.post('/register',              register);
router.post('/login',                 login);
router.get('/me',        protect,     getMe);
router.post('/logout',   protect,     logout);
router.post('/forgot-password',       forgotPassword);
router.put('/reset-password/:token',  resetPassword);
router.get('/verify-email/:token',    verifyEmail);
router.post('/resend-verification',   protect, resendVerification);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(res, req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  }
);

module.exports = router;