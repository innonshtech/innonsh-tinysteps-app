import { apiClient } from '../api/client';

export const FeesService = {
    getStudentFees: async (studentId: string) => {
        const response = await apiClient.get(`/parent/fees/${studentId}`);
        return response.data;
    },
};

