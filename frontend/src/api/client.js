import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/v1/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
