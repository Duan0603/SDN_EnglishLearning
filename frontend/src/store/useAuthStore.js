import { create } from 'zustand';
import { storage } from '../utils/storage';
import client from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isBootstrapping: true,
  error: null,

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
      const response = await client.post('/auth/login', { email, password });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userId', user._id || user.id);
      set({ user, token, isLoading: false, isBootstrapping: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed', 
        isLoading: false 
      });
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/signup', userData);
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userId', user._id || user.id);
      set({ user, token, isLoading: false, isBootstrapping: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
    }
  },

  googleLogin: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/google-login', { idToken });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      await storage.setItem('userId', user._id || user.id);
      set({ user, token, isLoading: false, isBootstrapping: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Google Login failed', 
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
