import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import { Config } from '../constants/config';

import { API_CONFIG } from '../config/api';

export const apiClient = axios.create({
    baseURL: Config.API_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
    },
    // Ensure Axios sends cookies if applicable, though we will inject manually
    withCredentials: true,
});

// Request Interceptor: Attach JWT Token from SecureStore as a Cookie
apiClient.interceptors.request.use(
    async (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        try {
            const credentials = await Keychain.getGenericPassword();
            const token = credentials ? credentials.password : null;
            if (token) {
                // The backend expects the token in the Cookie header natively.
                config.headers.Cookie = `token=${token}`;
            }
        } catch (error) {
            console.error('Error fetching token from SecureStore', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.error('[API Error] Request timed out. Backend might be unreachable.');
        } else if (error.message === 'Network Error') {
            console.error(`[API Error] Network Error! URL: ${error.config?.baseURL}${error.config?.url}. ` +
            `Ensure the backend is running and accessible on the same network.`);
        }

        if (error.response && error.response.status === 401) {
            console.log('Unauthorized request. Logging out...');
            // Lazy import to avoid require cycle with authStore
            const { useAuthStore } = require('../store/authStore');
            await useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

