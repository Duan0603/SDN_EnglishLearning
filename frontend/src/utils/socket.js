import { io } from 'socket.io-client';
import { Platform } from 'react-native';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || 
  (__DEV__ ? (Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000') : 'https://api.apex-ielts.com');

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
