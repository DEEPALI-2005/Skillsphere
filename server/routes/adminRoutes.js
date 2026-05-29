const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  suspendUser,
  verifyUser,
  getAllGigs,
  deleteGig
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Sab admin routes protected hain
router.use(protect, authorize('admin'));

router.get('/stats',              getStats);
router.get('/users',              getAllUsers);
router.put('/users/:id/suspend',  suspendUser);
router.put('/users/:id/verify',   verifyUser);
router.get('/gigs',               getAllGigs);
router.delete('/gigs/:id',        deleteGig);

module.exports = router;