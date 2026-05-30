import axios from 'axios';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { storage } from '../utils/storage';

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Tự động nhận diện URL API dựa trên nền tảng
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3017/api/v1'; // Android Emulator
  }
  // Web và iOS Simulator đều có thể dùng localhost
  return 'http://localhost:3017/api/v1';
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

// Global Response Interceptor
client.interceptors.response.use(
  (response) => {
    // Global Success Handling: Chỉ show toast với các request mutate (POST, PUT, DELETE, PATCH)
    // Hoặc khi server trả về thông điệp thành công cụ thể.
    if (response.config.method !== 'get' && response.data?.message) {
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: response.data.message,
        position: 'bottom'
      });
    }
    return response;
  },
  (error) => {
    // Global Error Handling
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
    
    Toast.show({
      type: 'error',
      text1: 'Lỗi',
      text2: errorMessage,
      position: 'bottom'
    });

    // Handle 401 Unauthorized globally if needed
    if (error.response?.status === 401) {
      // Optional: Dispatch logout event or clear token
      // storage.deleteItem('userToken');
    }

    return Promise.reject(error);
  }
);

export default client;
