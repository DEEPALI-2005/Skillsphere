const express = require('express');
const router = express.Router();
const {
  createProposal,
  getGigProposals,
  getMyProposals,
  acceptProposal,
  rejectProposal
} = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/:gigId',          protect, authorize('freelancer'), createProposal);
router.get('/gig/:gigId',       protect, getGigProposals);
router.get('/my',               protect, getMyProposals);
router.put('/:id/accept',       protect, acceptProposal);
router.put('/:id/reject',       protect, rejectProposal);

module.exports = router;