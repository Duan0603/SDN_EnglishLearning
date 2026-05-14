import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await client.post('/user/login', { email, password });
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await SecureStore.setItemAsync('userToken', token);
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
      const response = await client.post('/user/signup', userData);
      const { metadata } = response.data;
      const token = metadata.tokens.accessToken;
      const user = metadata.user;
      
      await SecureStore.setItemAsync('userToken', token);
      set({ user, token, isLoading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed', 
        isLoading: false 
      });
    }
  },


  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ user: null, token: null });
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const response = await client.get('/auth/profile');
        set({ user: response.data, token });
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('userToken');
      set({ user: null, token: null });
    }
  }
}));

export default useAuthStore;
