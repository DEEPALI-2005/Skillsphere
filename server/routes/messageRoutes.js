const express = require('express');
const router = express.Router();
const { getConversation, getConversations } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/:userId',       protect, getConversation);

module.exports = router;