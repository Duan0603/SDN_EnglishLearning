import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerAudioHandlers } from './audio.handler';

let ioInstance: Server | null = null;

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

  ioInstance = io;
  return io;
};

export const emitSlotUpdate = (slotId: string, mentorId: string, isBooked: boolean) => {
  if (ioInstance) {
    console.log(`[Socket.io] Emitting slot:update - slotId: ${slotId}, isBooked: ${isBooked}`);
    ioInstance.emit('slot:update', { slotId, mentorId, isBooked });
  } else {
    console.log('[Socket.io] No active server instance to emit event.');
  }
};
