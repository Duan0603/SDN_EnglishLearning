import { create } from 'zustand';
import { storage } from '../utils/storage';
import client from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/auth/login', { email, password });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await storage.setItem('userToken', token);
      set({ user, token, isLoading: false });
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
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
    }
  },


  logout: async () => {
    await storage.deleteItem('userToken');
    set({ user: null, token: null });
  },

  restoreToken: async () => {
    try {
      const token = await storage.getItem('userToken');
      if (token) {
        const response = await client.get('/auth/profile');
        set({ user: response.data, token });
      }
    } catch (error) {
      await storage.deleteItem('userToken');
      set({ user: null, token: null });
    }
  }
}));


export default useAuthStore;
