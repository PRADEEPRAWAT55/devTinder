const socket = require('socket.io');
const { ChatMessage } = require('../../model/chat');

const onlineUsers = new Map();

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('userOnline', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit('userStatusChange', { userId, isOnline: true });
    });


    socket.on('joinChat', (userId, connectionId) => {
      const uniqueRoomId = [userId, connectionId].sort().join('_');
      socket.join(uniqueRoomId);
      const isOtherUserOnline = onlineUsers.has(connectionId);
      socket.emit('userStatusChange', { userId: connectionId, isOnline: isOtherUserOnline });
    });

    socket.on('sendMessage', async (room, message) => {
      const chat = await ChatMessage.find({ roomId: room });
      if (chat.length === 0) {
        const newChat = new ChatMessage({
          roomId: room,
          message: [message]
        });
        await newChat.save();
      } else {
        chat[0].message.push(message);
        await chat[0].save();
      }
      io.to(room).emit('receiveMessage', message);
    });

    socket.on('typing', (room) => {
      socket.to(room).emit('typing');
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('userStatusChange', { userId: socket.userId, isOnline: false });
      }
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = initializeSocket;