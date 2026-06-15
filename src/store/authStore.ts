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
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // initial load state for splash

    login: async (token: string, user: User) => {
        try {
            await Keychain.setGenericPassword('userToken', token);
            set({ token, user, isAuthenticated: true });
        } catch (e) {
            console.error('Failed to save token', e);
        }
    },

    logout: async () => {
        try {
            await Keychain.resetGenericPassword();
            // Import childStore dynamically if needed, or clear it elsewhere. For now, just reset auth.
            set({ token: null, user: null, isAuthenticated: false });
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

