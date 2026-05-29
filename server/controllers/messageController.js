const Message = require('../models/Message');

// @GET /api/messages/:userId — Conversation dekho
const getConversation = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .populate('sender',   'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @GET /api/messages/conversations — Sab conversations
const getConversations = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender',   'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 });

    // Unique conversations nikalo
    const conversationMap = {};
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user._id.toString()
        ? msg.receiver : msg.sender;
      const key = otherUser._id.toString();
      if (!conversationMap[key]) {
        conversationMap[key] = {
          user:        otherUser,
          lastMessage: msg,
          unreadCount: 0
        };
      }
      if (!msg.isRead && msg.receiver._id.toString() === req.user._id.toString()) {
        conversationMap[key].unreadCount++;
      }
    });

    res.json({
      success: true,
      conversations: Object.values(conversationMap)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getConversation, getConversations };