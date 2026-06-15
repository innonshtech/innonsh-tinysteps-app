import { apiClient } from '../api/client';

export const AttendanceService = {
    getStudentAttendance: async (studentId: string) => {
        const response = await apiClient.get(`/parent/attendance/${studentId}`);
        return response.data;
    },
};

