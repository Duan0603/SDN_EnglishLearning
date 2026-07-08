import { create } from 'zustand';
import { storage } from '../utils/storage';

export const useNotificationStore = create((set, get) => ({
  readNotifIds: [],

  loadReadNotifIds: async () => {
    try {
      const stored = await storage.getItem('readNotifIds');
      if (stored) {
        set({ readNotifIds: JSON.parse(stored) });
      }
    } catch (e) {
      console.log('Error loading readNotifIds:', e);
    }
  },

  markAsRead: async (id) => {
    const { readNotifIds } = get();
    if (!readNotifIds.includes(id)) {
      const updated = [...readNotifIds, id];
      set({ readNotifIds: updated });
      try {
        await storage.setItem('readNotifIds', JSON.stringify(updated));
      } catch (e) {
        console.log('Error saving readNotifIds:', e);
      }
    }
  },

  markAllAsRead: async (ids) => {
    const { readNotifIds } = get();
    const updated = Array.from(new Set([...readNotifIds, ...ids]));
    set({ readNotifIds: updated });
    try {
      await storage.setItem('readNotifIds', JSON.stringify(updated));
    } catch (e) {
      console.log('Error saving readNotifIds:', e);
    }
  }
}));
