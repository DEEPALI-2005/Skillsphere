const Review = require('../models/Review');
const User = require('../models/User');
const Gig = require('../models/Gig');

// @POST /api/reviews — Review do
const createReview = async (req, res, next) => {
  try {
    const { gigId, revieweeId, rating, comment } = req.body;

    // Gig exist karta hai?
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    // Pehle se review diya hai?
    const existingReview = await Review.findOne({
      gig: gigId,
      reviewer: req.user._id
    });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Pehle se review de chuke ho!' });
    }

    // Review banao
    const review = await Review.create({
      gig:      gigId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment
    });

    // User ki average rating update karo
    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: avgRating.toFixed(1) });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review de diya!',
      review: populatedReview
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/reviews/user/:userId — User ke reviews dekho
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @GET /api/reviews/gig/:gigId — Gig ke reviews
const getGigReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReview, getUserReviews, getGigReviews };