const User = require('../models/User');
const Gig = require('../models/Gig');
const Payment = require('../models/Payment');
const AdminLog = require('../models/AdminLog');

// @GET /api/admin/stats — Platform stats
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFreelancers,
      totalClients,
      totalGigs,
      openGigs,
      completedGigs,
      payments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'client' }),
      Gig.countDocuments(),
      Gig.countDocuments({ status: 'open' }),
      Gig.countDocuments({ status: 'completed' }),
      Payment.find({ status: 'released' })
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalFreelancers,
        totalClients,
        totalGigs,
        openGigs,
        completedGigs,
        totalRevenue
      }
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/admin/users — Sab users dekho
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let filter = {};

    if (role)   filter.role = role;
    if (search) filter.name = new RegExp(search, 'i');

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });

  } catch (error) {
    next(error);
  }
};

// @PUT /api/admin/users/:id/suspend — User suspend karo
const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila!' });
    }

    user.isActive = !user.isActive;
    await user.save();

    const action = user.isActive ? 'activated' : 'suspended';

    res.json({
      success: true,
      message: `User ${action} ho gaya!`,
      user
    });

  } catch (error) {
    next(error);
  }
};

// @PUT /api/admin/users/:id/verify — Freelancer verify karo
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila!' });
    }

    res.json({ success: true, message: 'User verify ho gaya! ✅', user });

  } catch (error) {
    next(error);
  }
};

// @GET /api/admin/gigs — Sab gigs dekho
const getAllGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find()
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: gigs.length, gigs });

  } catch (error) {
    next(error);
  }
};

// @DELETE /api/admin/gigs/:id — Gig delete karo
const deleteGig = async (req, res, next) => {
  try {
    await Gig.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gig delete ho gaya!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAllUsers,
  suspendUser,
  verifyUser,
  getAllGigs,
  deleteGig
};