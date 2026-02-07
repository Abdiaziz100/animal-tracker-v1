// Alert Model
export interface Alert {
  id: number;
  animal_id: number;
  animal_name: string;
  alert_type: 'EXIT' | 'LOW_BATTERY' | 'OTHER';
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface AlertListResponse {
  alerts: Alert[];
}

export interface MarkAlertReadResponse {
  success: boolean;
}

// Geofence Model
export interface Geofence {
  lat: number;
  lng: number;
  radius: number;
}

export interface GeofenceResponse {
  lat: number;
  lng: number;
  radius: number;
}

// Bluetooth Status
export interface BluetoothStatusRequest {
  device_ids: string[];
  not_found_ids: string[];
}

export interface BluetoothStatusResponse {
  success: boolean;
  updated: string[];
  message: string;
}

// BLE Device for scanning
export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  distance: string;
  isAnimal: boolean;
  animalName?: string;
}

