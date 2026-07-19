import axios from 'axios';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import { storage } from '../utils/storage';

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return 'http://localhost:5000/api/v1';
    }
    const hostUri = Constants.expoConfig?.hostUri;
    const hostIP = hostUri ? hostUri.split(':')[0] : '192.168.1.9';
    return `http://${hostIP}:5000/api/v1`;
  }
  return 'https://api.apex-ielts.com/api/v1';
};

const client = axios.create({
  baseURL: getBaseURL(),
  // withCredentials không cần thiết trên React Native mobile
  // Token được gửi thủ công qua header Authorization và x-client-id
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header (sử dụng storage an toàn cho cả Web và Mobile)
client.interceptors.request.use(async (config) => {
  const token = await storage.getItem('userToken');
  const userId = await storage.getItem('userId');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    config.headers['x-client-id'] = userId;
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
    // Thêm hideToast để component có thể tự handle UI nếu muốn.
    const isCheckExists = response.config.url?.includes('/check-exists');
    if (
      response.config.method !== 'get' && 
      response.data?.message && 
      !response.config.hideToast &&
      !isCheckExists
    ) {
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: response.data.message,
        position: 'top'
      });
    }
    return response;
  },
  (error) => {
    // Global Error Handling
    const isLogout = error.config?.url?.includes('/auth/logout');
    
    // Auto logout on 401 Unauthorized (e.g. expired session or keyStore not found)
    if (error.response?.status === 401) {
      try {
        const useAuthStore = require('../store/useAuthStore').default;
        useAuthStore.getState().clearSession();
      } catch (err) {
        storage.deleteItem('userToken');
        storage.deleteItem('userId');
      }
    }

    if (!error.config?.hideToast && !isLogout) {
      let errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      
      if (errorMessage.toLowerCase().includes('keystore')) {
        errorMessage = 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.';
      }

      Toast.show({
        type: 'error',
        text1: 'Thông báo',
        text2: errorMessage,
        position: 'top'
      });
    }

    return Promise.reject(error);
  }
);

export default client;
