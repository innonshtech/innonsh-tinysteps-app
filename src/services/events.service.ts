import { apiClient } from '../api/client';

export const EventsService = {
    getPublishedEvents: async () => {
        const response = await apiClient.get('/events?status=published');
        return response.data;
    },
};

