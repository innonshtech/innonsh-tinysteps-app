import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { apiClient } from '../api/client';
import { formatPersonName } from '../utils/formatName';

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
            const normalizedUser: User = {
                ...user,
                name: formatPersonName(user, 'Parent'),
            };
            await Keychain.setGenericPassword('userToken', token);
            set({ token, user: normalizedUser, isAuthenticated: true });

            // Register FCM token after login (lazy import to avoid circular deps)
            try {
                const fcmService = require('../services/fcm.service');
                const fcmToken = await fcmService.initializeFCM();
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
                    const fcmService = require('../services/fcm.service');
                    await fcmService.unregisterToken(fcmToken);
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
                    const response = await apiClient.get('/auth/profile');
                    const rawUser = response.data.user || response.data;
                    const normalizedUser: User = {
                        ...rawUser,
                        name: formatPersonName(rawUser, 'Parent'),
                    };
                    set({
                        token,
                        user: normalizedUser,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    // Re-initialize FCM on app resume (handles token refresh cases)
                    try {
                        const fcmService = require('../services/fcm.service');
                        const fcmToken = await fcmService.initializeFCM();
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


