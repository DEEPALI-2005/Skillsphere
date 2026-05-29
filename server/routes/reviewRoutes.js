const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getGigReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',                protect, createReview);
router.get('/user/:userId',     getUserReviews);
router.get('/gig/:gigId',       getGigReviews);

module.exports = router;