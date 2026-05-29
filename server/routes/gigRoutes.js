const express = require('express');
const router = express.Router();
const {
  createGig,
  getAllGigs,
  getGigById,
  updateGig,
  deleteGig,
  getMyGigs
} = require('../controllers/gigController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/',     getAllGigs);
router.get('/my',   protect, getMyGigs);
router.get('/:id',  getGigById);
router.post('/',    protect, authorize('client'), createGig);
router.put('/:id',  protect, updateGig);
router.delete('/:id', protect, deleteGig);

module.exports = router;