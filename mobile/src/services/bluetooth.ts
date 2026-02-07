import { Platform } from 'react-native';

// Bluetooth service using react-native-ble-plx pattern
// Note: For production, install: expo install react-native-ble-plx

export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  localName?: string;
  serviceUUIDs?: string[];
}

export interface BluetoothConfig {
  serviceUUID: string;
  characteristicUUID: string;
}

// Animal tracker BLE configuration (matches backend)
export const BLE_CONFIG: BluetoothConfig = {
  serviceUUID: '0000181D-0000-1000-8000-00805F9B34FB', // Heart Rate Service (example)
  characteristicUUID: '00002A37-0000-1000-8000-00805F9B34FB', // Heart Rate Measurement
};

export class BluetoothService {
  private static instance: BluetoothService;
  private isScanning: boolean = false;
  private devices: Map<string, BLEDevice> = new Map();
  private listeners: Set<(devices: BLEDevice[]) => void> = new Set();
  private scanInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  // Check if Bluetooth is available and enabled
  async checkState(): Promise<{ available: boolean; enabled: boolean }> {
    try {
      // In a real implementation, use react-native-ble-plx
      // const manager = new BleManager();
      // const state = await manager.state();
      
      // For now, return mock values
      return { available: true, enabled: true };
    } catch (error) {
      return { available: false, enabled: false };
    }
  }

  // Request permissions for Bluetooth
  async requestPermissions(): Promise<boolean> {
    // iOS requires NSBluetoothAlwaysUsageDescription in Info.plist
    // Android requires BLUETOOTH and BLUETOOTH_ADMIN permissions
    return true;
  }

  // Start scanning for BLE devices
  async startScanning(): Promise<void> {
    if (this.isScanning) return;

    const state = await this.checkState();
    if (!state.available || !state.enabled) {
      throw new Error('Bluetooth is not available or not enabled');
    }

    this.isScanning = true;
    this.devices.clear();

    // Add simulated demo devices for testing
    this.addDemoDevices();

    // Start continuous scanning
    this.scanInterval = setInterval(() => {
      this.updateDemoDevices();
      this.emitDevices();
    }, 3000);

    // Emit initial devices
    setTimeout(() => this.emitDevices(), 500);
  }

  // Add demo devices for testing (simulates real BLE devices)
  private addDemoDevices(): void {
    const demoDevices: BLEDevice[] = [
      {
        id: 'demo-001',
        name: 'BLE-COW-001',
        rssi: -45,
        localName: 'Animal Tracker 001',
        serviceUUIDs: [BLE_CONFIG.serviceUUID],
      },
      {
        id: 'demo-002',
        name: 'BLE-SHEEP-002',
        rssi: -65,
        localName: 'Animal Tracker 002',
        serviceUUIDs: [BLE_CONFIG.serviceUUID],
      },
      {
        id: 'demo-003',
        name: 'BLE-GOAT-003',
        rssi: -80,
        localName: 'Animal Tracker 003',
        serviceUUIDs: [BLE_CONFIG.serviceUUID],
      },
      {
        id: 'demo-004',
        name: 'Unknown Device',
        rssi: -90,
        localName: 'Generic BLE',
      },
    ];

    demoDevices.forEach((device) => this.addDevice(device));
  }

  // Update demo devices with random RSSI changes (simulates movement)
  private updateDemoDevices(): void {
    this.devices.forEach((device) => {
      // Randomly adjust RSSI by -5 to +5 dBm
      const adjustment = Math.floor(Math.random() * 11) - 5;
      device.rssi = Math.max(-100, Math.min(-30, device.rssi + adjustment));
    });
  }

  // Stop scanning for BLE devices
  async stopScanning(): Promise<void> {
    this.isScanning = false;

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }

    this.emitDevices();
  }

  // Get list of discovered devices
  getDevices(): BLEDevice[] {
    return Array.from(this.devices.values());
  }

  // Add a device (called when device is discovered)
  addDevice(device: BLEDevice): void {
    this.devices.set(device.id, device);
  }

  // Remove a device (called when device is not seen for a while)
  removeDevice(deviceId: string): void {
    this.devices.delete(deviceId);
  }

  // Calculate approximate distance from RSSI
  calculateDistance(rssi: number): string {
    // TX power at 1 meter (calibrated for your devices)
    const txPower = -59; // dBm at 1 meter

    // Calculate distance using log-distance path loss model
    const distance = Math.pow(10, (txPower - rssi) / (10 * 2.5));

    if (distance < 1) return '< 1m';
    if (distance < 10) return `${Math.round(distance)}m`;
    if (distance < 100) return `${Math.round(distance)}m`;
    return '> 100m';
  }

  // Get RSSI signal strength indicator
  getSignalStrength(rssi: number): 'excellent' | 'good' | 'fair' | 'weak' | 'none' {
    if (rssi >= -50) return 'excellent';
    if (rssi >= -70) return 'good';
    if (rssi >= -85) return 'fair';
    if (rssi >= -100) return 'weak';
    return 'none';
  }

  // Subscribe to device updates
  subscribe(callback: (devices: BLEDevice[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Emit devices to all listeners
  private emitDevices(): void {
    const devices = this.getDevices();
    this.listeners.forEach((callback) => callback(devices));
  }

  // Dispose resources
  dispose(): void {
    this.stopScanning();
    this.listeners.clear();
    this.devices.clear();
  }
}

export default BluetoothService.getInstance();

