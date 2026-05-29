const express = require('express');
const router = express.Router();
const {
  createPayment,
  releasePayment,
  refundPayment,
  getMyPayments,
  getAllPayments
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create',        protect, authorize('client'), createPayment);
router.put('/:id/release',    protect, releasePayment);
router.put('/:id/refund',     protect, refundPayment);
router.get('/my',             protect, getMyPayments);
router.get('/admin',          protect, authorize('admin'), getAllPayments);

module.exports = router;