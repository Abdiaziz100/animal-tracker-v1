import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No auth header needed - backend uses simple session-less auth

// ============ AUTH API ============
export const authAPI = {
  login: (email, password) => api.post('/login', { email, password }),
  register: (data) => api.post('/register', data),
};

// ============ ANIMALS API ============
export const animalsAPI = {
  getAll: () => api.get('/animals'),
  getOne: (id) => api.get(`/animals/${id}`),
  create: (data) => api.post('/animals', data),
  update: (id, data) => api.put(`/animals/${id}`, data),
  delete: (id) => api.delete(`/animals/${id}`),
};

// ============ TRACKING API ============
export const trackingAPI = {
  // Hardware sends GPS data here
  updateGPS: (data) => api.post('/gps', data),
  
  // Get alerts
  getAlerts: () => api.get('/alerts'),
  markAlertRead: (id) => api.post(`/alerts/${id}/read`),
  
  // Geofence
  getGeofence: () => api.get('/geofence'),
  setGeofence: (data) => api.post('/geofence', data),
  
  // Simulation
  simulate: () => api.post('/simulate/movement'),
};

// ============ GEOFENCE API ============
export const geofenceAPI = {
  get: () => api.get('/geofence'),
  set: (data) => api.post('/geofence', data),
};

// ============ HEALTH API ============
export const healthAPI = {
  check: () => api.get('/health'),
};

// ============ BLUETOOTH API ============
export const bluetoothAPI = {
  // Update animal status based on Bluetooth detection
  updateStatus: (data) => api.post('/bluetooth/status', data),
  
  // Get animals with their Bluetooth connection status
  getBLEStatus: () => api.get('/animals/ble-status'),
};

export default api;

