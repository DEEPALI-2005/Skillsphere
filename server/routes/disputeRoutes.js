const express = require('express');
const router  = express.Router();
const {
  createDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute
} = require('../controllers/disputeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/',              protect, createDispute);
router.get('/my',             protect, getMyDisputes);
router.get('/',               protect, authorize('admin'), getAllDisputes);
router.put('/:id/resolve',    protect, authorize('admin'), resolveDispute);

module.exports = router;