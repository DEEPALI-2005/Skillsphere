const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File select karo!' });
    }
    const user = await User.findById(req.user._id);
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar:        req.file.path,
        avatarPublicId: req.file.filename
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Avatar upload ho gaya!',
      avatar:  req.file.path,
      user:    updatedUser
    });

  } catch (error) {
    next(error);
  }
};
const uploadPortfolio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File select karo!' });
    }

    const user = await User.findById(req.user._id);
    const portfolioItem = {
      url:      req.file.path,
      publicId: req.file.filename,
      title:    req.body.title || 'Portfolio Item'
    };

    user.portfolio = user.portfolio || [];
    user.portfolio.push(portfolioItem);
    await user.save();

    res.json({
      success:       true,
      message:       'Portfolio item add ho gaya!',
      portfolioItem,
      portfolio:     user.portfolio
    });

  } catch (error) {
    next(error);
  }
};
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume select karo!' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        resume:          req.file.path,
        resumePublicId:  req.file.filename
      },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Resume upload ho gaya!',
      resume:  req.file.path,
      user:    updatedUser
    });

  } catch (error) {
    next(error);
  }
};

const deletePortfolioItem = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    await cloudinary.uploader.destroy(publicId);

    const user = await User.findById(req.user._id);
    user.portfolio = user.portfolio.filter(item => item.publicId !== publicId);
    await user.save();

    res.json({ success: true, message: 'Portfolio item delete ho gaya!' });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAvatar,
  uploadPortfolio,
  uploadResume,
  deletePortfolioItem
};