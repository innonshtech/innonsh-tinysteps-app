// Read from the .env file located at the root of the project
import { API_CONFIG } from '../config/api';

export const Config = {
    API_URL: API_CONFIG.BASE_URL,
};

