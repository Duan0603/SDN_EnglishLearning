import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works
// For physical devices, use your computer's local IP address (e.g., 192.168.x.x)
const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000');

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'], // Prefer websocket over polling
});

// Optionally add connection listeners here
socket.on('connect', () => {
  console.log('[Socket] Connected to backend');
});

socket.on('disconnect', () => {
  console.log('[Socket] Disconnected from backend');
});
