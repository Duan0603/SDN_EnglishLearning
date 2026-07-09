import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { registerAudioHandlers } from './audio.handler';
import { BookingService } from '../services/booking.service';

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

    // Chat socket room joining
    socket.on('chat:join_room', ({ bookingId }) => {
      if (bookingId) {
        socket.join(`booking:room:${bookingId}`);
        console.log(`[Socket.io] Client ${socket.id} joined room booking:room:${bookingId}`);
      }
    });

    // Chat message sending
    socket.on('chat:send_message', async ({ bookingId, senderId, content }) => {
      if (!bookingId || !senderId || !content) return;
      try {
        const savedMessage = await BookingService.saveMessage(bookingId, senderId, content);
        io.to(`booking:room:${bookingId}`).emit('chat:receive_message', savedMessage);
        console.log(`[Socket.io] Message broadcasted in room booking:room:${bookingId} by ${senderId}`);
      } catch (err: any) {
        console.error('[Socket.io] Save message error:', err.message);
        socket.emit('chat:error', { success: false, message: 'Gửi tin nhắn thất bại.' });
      }
    });

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

export const emitBookingUpdate = (studentId: string, mentorId: string, bookingId: string, status: string) => {
  if (ioInstance) {
    console.log(`[Socket.io] Emitting booking:update - studentId: ${studentId}, mentorId: ${mentorId}, status: ${status}`);
    ioInstance.emit('booking:update', { studentId, mentorId, bookingId, status });
  } else {
    console.log('[Socket.io] No active server instance to emit event.');
  }
};

export const emitChatMessage = (bookingId: string, message: any) => {
  if (ioInstance) {
    console.log(`[Socket.io] Emitting chat:receive_message in room booking:room:${bookingId}`);
    ioInstance.to(`booking:room:${bookingId}`).emit('chat:receive_message', message);
  } else {
    console.log('[Socket.io] No active server instance to emit event.');
  }
};
