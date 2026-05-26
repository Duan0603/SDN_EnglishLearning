import { create } from 'zustand';
import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const getSocketURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    // Strip '/v1/api' suffix if present to get the root socket server URL
    return process.env.EXPO_PUBLIC_API_URL.replace('/v1/api', '');
  }
  return Platform.OS === 'web' 
    ? 'http://localhost:5000' 
    : 'http://10.0.2.2:5000';
};

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  socketId: null,
  pingResponse: null,

  /**
   * Connect to the Socket.io server
   */
  connectSocket: () => {
    const { socket, isConnected } = get();
    if (socket && isConnected) return;

    // Disconnect existing if any
    if (socket) {
      socket.disconnect();
    }

    const socketUrl = getSocketURL();
    console.log(`Connecting to Socket server at: ${socketUrl}`);

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log(`Socket connected successfully! ID: ${newSocket.id}`);
      set({ 
        isConnected: true, 
        socketId: newSocket.id 
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Socket disconnected. Reason: ${reason}`);
      set({ 
        isConnected: false, 
        socketId: null 
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Listen for the custom ping test event
    newSocket.on('pong-event', (data) => {
      console.log('Received pong response from server:', data);
      set({ pingResponse: data });
    });

    set({ socket: newSocket });
  },

  /**
   * Disconnect from the Socket.io server
   */
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      console.log('Socket disconnected manually.');
    }
    set({ 
      socket: null, 
      isConnected: false, 
      socketId: null,
      pingResponse: null
    });
  },

  /**
   * Send test ping to verify socket health (AC-3)
   * @param {object} payload - arbitrary test payload
   */
  sendPing: (payload = {}) => {
    const { socket, isConnected } = get();
    if (!socket || !isConnected) {
      console.warn('Cannot send ping. Socket is not connected.');
      return;
    }
    console.log('Sending ping-event payload:', payload);
    socket.emit('ping-event', {
      ...payload,
      clientTimestamp: new Date().toISOString()
    });
  }
}));

export default useSocketStore;
