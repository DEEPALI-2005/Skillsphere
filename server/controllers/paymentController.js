const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const Notification = require('../models/Notification');

// @POST /api/payments/create — Payment create karo (escrow mein daalo)
const createPayment = async (req, res, next) => {
  try {
    const { gigId, freelancerId, amount } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    // Sirf client pay kar sakta hai
    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi hai!' });
    }

    // Payment banao — escrow mein
    const payment = await Payment.create({
      gig:        gigId,
      client:     req.user._id,
      freelancer: freelancerId,
      amount,
      status:     'in-escrow',
      paidAt:     new Date()
    });

    // Freelancer ko notification
    await Notification.create({
      user:    freelancerId,
      type:    'payment_received',
      message: `₹${amount} escrow mein aaya! Kaam complete karo.`,
      link:    `/gig/${gigId}`
    });

    res.status(201).json({
      success: true,
      message: `₹${amount} escrow mein safe hai!`,
      payment
    });

  } catch (error) {
    next(error);
  }
};

// @PUT /api/payments/:id/release — Payment release karo freelancer ko
const releasePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment nahi mili!' });
    }

    // Sirf client release kar sakta hai
    if (payment.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi hai!' });
    }

    if (payment.status !== 'in-escrow') {
      return res.status(400).json({ success: false, message: 'Payment escrow mein nahi hai!' });
    }

    payment.status     = 'released';
    payment.releasedAt = new Date();
    await payment.save();

    // Gig complete karo
    await Gig.findByIdAndUpdate(payment.gig, { status: 'completed' });

    // Freelancer ko notification
    await Notification.create({
      user:    payment.freelancer,
      type:    'payment_received',
      message: `₹${payment.amount} tumhare account mein release ho gaya! 🎉`,
      link:    `/gig/${payment.gig}`
    });

    res.json({
      success: true,
      message: `₹${payment.amount} freelancer ko release ho gaya!`,
      payment
    });

  } catch (error) {
    next(error);
  }
};

// @PUT /api/payments/:id/refund — Refund karo client ko
const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment nahi mili!' });
    }

    if (payment.status !== 'in-escrow') {
      return res.status(400).json({ success: false, message: 'Sirf escrow payment refund ho sakti hai!' });
    }

    payment.status = 'refunded';
    await payment.save();

    // Gig wapas open karo
    await Gig.findByIdAndUpdate(payment.gig, { status: 'open' });

    res.json({
      success: true,
      message: `₹${payment.amount} refund ho gaya!`,
      payment
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/payments/my — Apni payments dekho
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      $or: [
        { client:     req.user._id },
        { freelancer: req.user._id }
      ]
    })
    .populate('gig',        'title status')
    .populate('client',     'name email')
    .populate('freelancer', 'name email')
    .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });

  } catch (error) {
    next(error);
  }
};

// @GET /api/payments/admin — Admin — sab payments dekho
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('gig',        'title')
      .populate('client',     'name email')
      .populate('freelancer', 'name email')
      .sort({ createdAt: -1 });

    // Stats
    const totalRevenue  = payments.filter(p => p.status === 'released')
                                  .reduce((sum, p) => sum + p.amount, 0);
    const escrowAmount  = payments.filter(p => p.status === 'in-escrow')
                                  .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      count: payments.length,
      totalRevenue,
      escrowAmount,
      payments
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  releasePayment,
  refundPayment,
  getMyPayments,
  getAllPayments
};