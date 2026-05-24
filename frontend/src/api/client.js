import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Tự động nhận diện: Nếu chạy trên Web thì trỏ về localhost, nếu chạy trên di động/emulator thì trỏ về 10.0.2.2
  return Platform.OS === 'web' 
    ? 'http://localhost:5000/v1/api' 
    : 'http://10.0.2.2:5000/v1/api';
};

const client = axios.create({
  baseURL: getBaseURL(), 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header (sử dụng storage an toàn cho cả Web và Mobile)
client.interceptors.request.use(async (config) => {
  const token = await storage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default client;
