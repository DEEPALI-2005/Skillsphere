const Message = require('../models/Message');
const Notification = require('../models/Notification');

const connectedUsers = {}; // userId → socketId

const socketHandler = (io) => {

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User online hua
    socket.on('user_online', (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User ${userId} is online`);
      io.emit('online_users', Object.keys(connectedUsers));
    });

    // Message bhejo
    socket.on('send_message', async (data) => {
      try {
        const { senderId, receiverId, content, gigId } = data;

        // Message save karo DB mein
        const message = await Message.create({
          sender:   senderId,
          receiver: receiverId,
          content,
          gig: gigId || null
        });

        // Populate karke bhejo
        const populatedMessage = await Message.findById(message._id)
          .populate('sender',   'name avatar')
          .populate('receiver', 'name avatar');

        // Receiver online hai toh real-time bhejo
        const receiverSocketId = connectedUsers[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', populatedMessage);

          // Notification bhi bhejo
          const notification = await Notification.create({
            user:    receiverId,
            type:    'new_message',
            message: `${populatedMessage.sender.name} ne message kiya!`,
            link:    `/chat/${senderId}`
          });
          io.to(receiverSocketId).emit('new_notification', notification);
        }

        // Sender ko bhi confirm karo
        socket.emit('message_sent', populatedMessage);

      } catch (error) {
        socket.emit('error', { message: 'Message send nahi hua!' });
      }
    });

    // Message read karo
    socket.on('mark_read', async ({ senderId, receiverId }) => {
      await Message.updateMany(
        { sender: senderId, receiver: receiverId, isRead: false },
        { isRead: true }
      );
    });

    // Typing indicator
    socket.on('typing', ({ senderId, receiverId }) => {
      const receiverSocketId = connectedUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { senderId });
      }
    });

    socket.on('stop_typing', ({ senderId, receiverId }) => {
      const receiverSocketId = connectedUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', { senderId });
      }
    });

    // User offline hua
    socket.on('disconnect', () => {
      const userId = Object.keys(connectedUsers).find(
        key => connectedUsers[key] === socket.id
      );
      if (userId) {
        delete connectedUsers[userId];
        io.emit('online_users', Object.keys(connectedUsers));
        console.log(`User ${userId} offline`);
      }
    });
  });
};

module.exports = socketHandler;