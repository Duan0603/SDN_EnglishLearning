import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getSocketURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/api(\/v1)?\/?$/, '');
  }
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:5000';
    }
    const hostUri = Constants.expoConfig?.hostUri;
    const hostIP = hostUri ? hostUri.split(':')[0] : '192.168.1.9';
    return `http://${hostIP}:5000`;
  }
  return 'https://api.apex-ielts.com';
};

export const socket = io(getSocketURL(), {
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
