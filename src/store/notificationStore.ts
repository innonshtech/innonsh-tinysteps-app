import { create } from 'zustand';
import { apiClient } from '../api/client';

interface NotificationState {
    unreadCount: number;
    loading: boolean;
    fetchUnreadCount: () => Promise<void>;
    setUnreadCount: (count: number) => void;
    decrementUnread: () => void;
    incrementUnread: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    unreadCount: 0,
    loading: false,

    fetchUnreadCount: async () => {
        try {
            set({ loading: true });
            const response = await apiClient.get('/notifications?unread=true&limit=1');
            if (response.data.success) {
                set({ unreadCount: response.data.unreadCount || 0 });
            }
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        } finally {
            set({ loading: false });
        }
    },

    setUnreadCount: (count: number) => set({ unreadCount: count }),

    decrementUnread: () => set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

    incrementUnread: () => set(state => ({ unreadCount: state.unreadCount + 1 })),
}));

