const User = require('../models/User');
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const updateData = {};

    if (req.body.name       !== undefined) updateData.name       = req.body.name;
    if (req.body.bio        !== undefined) updateData.bio        = req.body.bio;
    if (req.body.skills     !== undefined) updateData.skills     = req.body.skills;
    if (req.body.location   !== undefined) updateData.location   = req.body.location;
    if (req.body.hourlyRate !== undefined) updateData.hourlyRate = req.body.hourlyRate;

    console.log('Update data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile update ho gaya!',
      user: updatedUser
    });

  } catch (error) {
    next(error);
  }
};
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Purana aur naya password dono daalo!'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Purana password galat hai!'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password change ho gaya!' });

  } catch (error) {
    next(error);
  }
};
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila!' });
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
const getAllFreelancers = async (req, res, next) => {
  try {
    const { skills, location, minRate, maxRate } = req.query;
    let filter = { role: 'freelancer', isActive: true };

    if (skills)   filter.skills   = { $in: skills.split(',') };
    if (location) filter.location = new RegExp(location, 'i');
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    const freelancers = await User.find(filter).select('-password');
    res.json({ success: true, count: freelancers.length, freelancers });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllFreelancers
};