import axios, { AxiosInstance } from 'axios';
import API_CONFIG from '../config/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Animal,
  AnimalCreateRequest,
  GPSUpdateRequest,
  GPSUpdateResponse,
  Alert,
  Geofence,
} from '../models';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // ==================== AUTH ====================

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.client.post<LoginResponse>('/api/login', data);
      if (response.data.success && response.data.user) {
        this.setToken('mock-jwt-token'); // Backend doesn't use JWT yet
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.client.post<RegisterResponse>('/api/register', data);
      if (response.data.success && response.data.user) {
        this.setToken('mock-jwt-token');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  logout() {
    this.setToken(null);
  }

  // ==================== ANIMALS ====================

  async getAnimals(): Promise<Animal[]> {
    try {
      const response = await this.client.get('/api/animals');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return [];
      }
      throw error;
    }
  }

  async createAnimal(data: AnimalCreateRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.client.post('/api/animals', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async updateGPS(data: GPSUpdateRequest): Promise<GPSUpdateResponse> {
    try {
      const response = await this.client.post('/api/gps', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async simulateMovement(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/api/simulate/movement');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // ==================== ALERTS ====================

  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await this.client.get('/api/alerts');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return [];
      }
      throw error;
    }
  }

  async markAlertRead(alertId: number): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post(`/api/alerts/${alertId}/read`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // ==================== GEOFENCE ====================

  async getGeofence(): Promise<Geofence> {
    try {
      const response = await this.client.get('/api/geofence');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return { lat: -1.2921, lng: 36.8219, radius: 0.5 };
      }
      throw error;
    }
  }

  async updateGeofence(data: { lat: number; lng: number; radius: number }): Promise<{ success: boolean }> {
    try {
      const response = await this.client.post('/api/geofence', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // ==================== BLUETOOTH ====================

  async updateBluetoothStatus(deviceIds: string[], notFoundIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.post('/api/bluetooth/status', {
        device_ids: deviceIds,
        not_found_ids: notFoundIds,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async getBLEStatus(): Promise<Animal[]> {
    try {
      const response = await this.client.get('/api/animals/ble-status');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return [];
      }
      throw error;
    }
  }

  // ==================== HEALTH ====================

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/api/health');
      return response.data;
    } catch (error: any) {
      return { status: 'unhealthy', timestamp: new Date().toISOString() };
    }
  }
}

export const apiService = new ApiService();
export default apiService;

