import Config from 'react-native-config';

// Centralized API Configuration

const getApiUrl = () => {
    // Determine the environment URL
    let url = Config.REACT_NATIVE_API_URL || 'http://10.0.2.2:3000/api';

    // Diagnostic validation for mobile reachability
    if (__DEV__) {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            console.warn(
                `[API Config] Warning: You are using ${url} in development. ` +
                `This will NOT work on a physical device. ` +
                `Please update REACT_NATIVE_API_URL in your .env file to use your machine's LAN IP address (e.g., http://192.168.x.x:3000/api).`
            );
        }
    }

    return url;
};

export const API_CONFIG = {
    BASE_URL: getApiUrl(),
    TIMEOUT: 10000, // 10 seconds timeout
};
