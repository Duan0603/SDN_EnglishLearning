import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.io server
 * @param {object} server - HTTP Server instance
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev, can be restricted later
      methods: ['GET', 'POST'],
    },
  });

  console.log('Socket.io server initialized');

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Heartbeat ping-pong for connection verification (AC-3)
    socket.on('ping-event', (data) => {
      console.log(`Received ping from client ${socket.id}:`, data);
      socket.emit('pong-event', {
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Get Socket.io server instance
 * @returns {object} io instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
