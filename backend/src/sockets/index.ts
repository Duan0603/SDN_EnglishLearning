import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerAudioHandlers } from './audio.handler';

export const initSockets = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Register handlers
    registerAudioHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};
