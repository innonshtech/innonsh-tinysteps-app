import { apiClient } from '../api/client';

export const DashboardService = {
    getDashboardData: async (studentId: string) => {
        const response = await apiClient.get(`/parent/dashboard/${studentId}`);
        return response.data;
    },
};

