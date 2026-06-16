import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '../api/client';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    fcmToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setFcmToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    fcmToken: null,
    isAuthenticated: false,
    isLoading: true, // initial load state for splash

    setFcmToken: (fcmToken: string | null) => set({ fcmToken }),

    login: async (token: string, user: User) => {
        try {
            await Keychain.setGenericPassword('userToken', token);
            set({ token, user, isAuthenticated: true });

            // Register FCM token after login (lazy import to avoid circular deps)
            try {
                const { initializeFCM } = await import('../services/fcm.service');
                const fcmToken = await initializeFCM();
                if (fcmToken) {
                    set({ fcmToken });
                }
            } catch (fcmError) {
                console.error('[AuthStore] FCM initialization failed:', fcmError);
                // Non-fatal — app still works without push notifications
            }
        } catch (e) {
            console.error('Failed to save token', e);
        }
    },

    logout: async () => {
        try {
            // Unregister FCM token before clearing credentials
            const { fcmToken } = get();
            if (fcmToken) {
                try {
                    const { unregisterToken } = await import('../services/fcm.service');
                    await unregisterToken(fcmToken);
                } catch (fcmError) {
                    console.error('[AuthStore] FCM unregister failed:', fcmError);
                }
            }

            await Keychain.resetGenericPassword();
            set({ token: null, user: null, isAuthenticated: false, fcmToken: null });
        } catch (e) {
            console.error('Failed to clear token', e);
        }
    },

    checkAuth: async () => {
        try {
            set({ isLoading: true });

            const credentials = await Keychain.getGenericPassword();
            const token = credentials ? credentials.password : null;
            
            if (token) {
                try {
                    // Verify token by fetching user profile
                    const response = await apiClient.get('/auth/me');
                    set({
                        token,
                        user: response.data.user || response.data, // adjust depending on API response
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Re-initialize FCM on app resume (handles token refresh cases)
                    try {
                        const { initializeFCM } = await import('../services/fcm.service');
                        const fcmToken = await initializeFCM();
                        if (fcmToken) {
                            set({ fcmToken });
                        }
                    } catch (fcmError) {
                        console.error('[AuthStore] FCM re-init failed:', fcmError);
                    }
                } catch (apiError) {
                    // Token invalid or expired
                    await Keychain.resetGenericPassword();
                    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
                }
            } else {
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        } catch (e) {
            set({ isLoading: false });
            console.error('Auth check failed', e);
        }
    },
}));


