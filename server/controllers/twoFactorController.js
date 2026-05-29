const speakeasy = require('speakeasy');
const QRCode    = require('qrcode');
const User      = require('../models/User');
const setup2FA = async (req, res, next) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `SkillSphere (${req.user.email})`
    });
    await User.findByIdAndUpdate(req.user._id, {
      twoFactorSecret:  secret.base32,
      twoFactorEnabled: false
    });
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success:  true,
      qrCode:   qrCodeUrl,
      secret:   secret.base32,
      message:  'QR Code scan karo Google Authenticator se!'
    });

  } catch (error) {
    next(error);
  }
};
const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user      = await User.findById(req.user._id);

    const verified = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token,
      window:   1
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Code galat hai!'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: true
    });

    res.json({ success: true, message: '2FA enable ho gaya! ✅' });

  } catch (error) {
    next(error);
  }
};
const validate2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId).select('+twoFactorSecret');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila!' });
    }

    const verified = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token,
      window:   1
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Code galat hai!' });
    }

    const generateToken = require('../utils/generateToken');
    const jwtToken = generateToken(res, user._id);

    res.json({
      success: true,
      message: '2FA verified!',
      token:   jwtToken,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      }
    });

  } catch (error) {
    next(error);
  }
};
const disable2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user      = await User.findById(req.user._id).select('+twoFactorSecret');

    const verified = speakeasy.totp.verify({
      secret:   user.twoFactorSecret,
      encoding: 'base32',
      token,
      window:   1
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'Code galat hai!' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      twoFactorEnabled: false,
      twoFactorSecret:  ''
    });

    res.json({ success: true, message: '2FA disable ho gaya!' });

  } catch (error) {
    next(error);
  }
};

module.exports = { setup2FA, verify2FA, validate2FA, disable2FA };