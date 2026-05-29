const express = require('express');
const router  = express.Router();
const {
  getMatchedFreelancers,
  getTrendingSkills,
  getRecommendedGigs
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/match/:gigId',  protect, getMatchedFreelancers);
router.get('/trending',      getTrendingSkills);
router.get('/recommend',     protect, getRecommendedGigs);

module.exports = router;