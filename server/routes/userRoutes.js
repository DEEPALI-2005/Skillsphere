const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getUserById,
  getAllFreelancers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profile',         protect, getProfile);
router.put('/profile',         protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/freelancers',     getAllFreelancers);
router.get('/:id',             getUserById);

module.exports = router;