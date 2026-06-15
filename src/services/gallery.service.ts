import { apiClient } from '../api/client';

export const GalleryService = {
    getGallery: async () => {
        const response = await apiClient.get('/gallery');
        return response.data;
    },
};

