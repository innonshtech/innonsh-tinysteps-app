import { apiClient } from '../api/client';

export interface SettingsResponse {
    success: boolean;
    settings: {
        schoolName: string;
        academicYear: string;
        featureFlags?: {
            [key: string]: boolean;
        };
    };
}

export const SettingsService = {
    getSettings: async (): Promise<SettingsResponse> => {
        const response = await apiClient.get('/api/settings');
        return response.data;
    },
};

