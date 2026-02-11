// API Configuration
const API_CONFIG = {
  // Production: Replace with your deployed backend URL
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://10.21.201.96:5000',
  
  // For local development:
  // Android emulator: 'http://10.0.2.2:5000'
  // iOS simulator: 'http://localhost:5000'
  // Physical device: 'http://YOUR_IP:5000'
  
  TIMEOUT: 30000,
};

export default API_CONFIG;
