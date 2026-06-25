import { create } from 'zustand';
import { storage } from '../utils/storage';
import client from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isBootstrapping: true,
  error: null,

  clearError: () => set({ error: null }),

  setSession: async (user, token) => {
    if (token) await storage.setItem('userToken', token);
    if (user) {
      const userId = user._id || user.id;
      await storage.setItem('userId', userId);
    }
    set({ user, token, isLoading: false, isBootstrapping: false, error: null });
  },

  clearSession: async () => {
    await storage.deleteItem('userToken');
    await storage.deleteItem('userId');
    set({ user: null, token: null, isLoading: false, isBootstrapping: false, error: null });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/login', { email, password }, { hideToast: true });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userId', user._id || user.id);
      set({ user, token, isLoading: false, isBootstrapping: false });
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || `Lỗi mạng/Hệ thống: ${error.message}`;
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/signup', userData, { hideToast: true });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userId', user._id || user.id);
      set({ user, token, isLoading: false, isBootstrapping: false });
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },

  googleLogin: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/google-login', { idToken }, { hideToast: true });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userId', user._id || user.id);
      set({ user, token, isLoading: false, isBootstrapping: false });
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || 'Đăng nhập bằng Google thất bại.';
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
    }
  },
  logout: async () => {
    try {
      await client.post('/auth/logout');
    } catch (error) {
      // Continue clearing local auth state even if the remote session is already gone.
    } finally {
      await storage.deleteItem('userToken');
      await storage.deleteItem('userId');
      set({ user: null, token: null, isLoading: false, isBootstrapping: false, error: null });
    }
  },

  restoreToken: async () => {
    set({ isBootstrapping: true });
    try {
      const token = await storage.getItem('userToken');
      const userId = await storage.getItem('userId');
      if (token && userId) {
        const response = await client.get('/auth/profile');
        const user = response.data.metadata;
        await storage.setItem('userId', user._id || user.id);
        set({ user, token, isLoading: false, isBootstrapping: false, error: null });
        return;
      }

      set({ user: null, token: null, isLoading: false, isBootstrapping: false, error: null });
    } catch (error) {
      await storage.deleteItem('userToken');
      await storage.deleteItem('userId');
      set({ user: null, token: null, isLoading: false, isBootstrapping: false, error: null });
    }
  }
}));


export default useAuthStore;
