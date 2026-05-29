const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');

// @POST /api/disputes — Dispute raise karo
const createDispute = async (req, res, next) => {
  try {
    const { gigId, paymentId, againstId, reason, description } = req.body;

    // Pehle se dispute hai?
    const existing = await Dispute.findOne({
      gig:      gigId,
      raisedBy: req.user._id,
      status:   { $in: ['open', 'under_review'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Is gig pe pehle se dispute open hai!'
      });
    }

    const dispute = await Dispute.create({
      gig:       gigId,
      payment:   paymentId,
      raisedBy:  req.user._id,
      against:   againstId,
      reason,
      description
    });

    // Admin ko notification
    await Notification.create({
      user:    againstId,
      type:    'new_message',
      message: 'Tumhare khilaf ek dispute raise kiya gaya hai!',
      link:    `/disputes/${dispute._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Dispute raise ho gaya! Admin review karega.',
      dispute
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/disputes/my — Apne disputes
const getMyDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({
      $or: [
        { raisedBy: req.user._id },
        { against:  req.user._id }
      ]
    })
    .populate('gig',      'title')
    .populate('raisedBy', 'name email')
    .populate('against',  'name email')
    .sort({ createdAt: -1 });

    res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    next(error);
  }
};

// @GET /api/disputes — Admin — sab disputes
const getAllDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find()
      .populate('gig',      'title')
      .populate('raisedBy', 'name email')
      .populate('against',  'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/disputes/:id/resolve — Admin resolve kare
const resolveDispute = async (req, res, next) => {
  try {
    const { status, resolution } = req.body;

    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        resolvedBy: req.user._id
      },
      { new: true }
    )
    .populate('raisedBy', 'name email')
    .populate('against',  'name email');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute nahi mila!' });
    }

    // Dono parties ko notify karo
    await Notification.create({
      user:    dispute.raisedBy._id,
      type:    'new_message',
      message: `Tumhara dispute resolve ho gaya! Status: ${status}`,
      link:    `/disputes/${dispute._id}`
    });

    await Notification.create({
      user:    dispute.against._id,
      type:    'new_message',
      message: `Dispute resolve ho gaya! Status: ${status}`,
      link:    `/disputes/${dispute._id}`
    });

    res.json({ success: true, message: 'Dispute resolve ho gaya!', dispute });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute
};