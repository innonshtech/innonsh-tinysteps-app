import { create } from 'zustand';
import { apiClient } from '../api/client';

interface NotificationState {
    unreadCount: number;
    loading: boolean;
    fcmToken: string | null;
    fetchUnreadCount: () => Promise<void>;
    setUnreadCount: (count: number) => void;
    decrementUnread: () => void;
    incrementUnread: () => void;
    setFcmToken: (token: string | null) => void;
    /** Mark a single notification as read by ID (called on push tap) */
    markAsReadById: (notificationId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    unreadCount: 0,
    loading: false,
    fcmToken: null,

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

    setFcmToken: (fcmToken: string | null) => set({ fcmToken }),

    markAsReadById: async (notificationId: string) => {
        try {
            await apiClient.put('/notifications', { id: notificationId, isRead: true });
            const { unreadCount } = get();
            set({ unreadCount: Math.max(0, unreadCount - 1) });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },
}));


