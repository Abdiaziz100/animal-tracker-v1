// API Configuration
const API_CONFIG = {
  // Use your computer's IP address for physical device on same WiFi
  // Android emulator: 'http://10.0.2.2:5000'
  // iOS simulator: 'http://localhost:5000'
  // Production: Replace with Railway URL
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000',
  TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;
