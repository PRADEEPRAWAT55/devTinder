const socket = require('socket.io');

const initializeSocket = (httpServer) => {
  const io = socket(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('joinChat', (userId, connectionId) => {
      const uniqueRoomId = [userId, connectionId].sort().join('_');
      socket.join(uniqueRoomId);
    });


    socket.on('sendMessage', (room, message) => {
      console.log('Message received on server:', room);
      io.to(room).emit('receiveMessage', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = initializeSocket;