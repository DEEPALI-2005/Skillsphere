const express = require('express');
const router  = express.Router();
const {
  uploadAvatar,
  uploadPortfolio,
  uploadResume,
  deletePortfolioItem
} = require('../controllers/uploadController');
const {
  uploadAvatar:    avatarUpload,
  uploadPortfolio: portfolioUpload,
  uploadResume:    resumeUpload
} = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.post('/avatar',            protect, avatarUpload.single('avatar'),       uploadAvatar);
router.post('/portfolio',         protect, portfolioUpload.single('portfolio'),  uploadPortfolio);
router.post('/resume',            protect, resumeUpload.single('resume'),        uploadResume);
router.delete('/portfolio/:publicId', protect, deletePortfolioItem);

module.exports = router;