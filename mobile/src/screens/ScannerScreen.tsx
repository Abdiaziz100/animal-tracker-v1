import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BluetoothService, { BLEDevice } from '../services/bluetooth';
import apiService from '../services/api';
import type { Animal } from '../models';

export default function ScannerScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAnimals();
    return () => {
      BluetoothService.stopScanning();
    };
  }, []);

  const loadAnimals = async () => {
    try {
      const data = await apiService.getAnimals();
      setAnimals(data);
    } catch (error) {
      console.error('Error loading animals:', error);
    }
  };

  const startScan = async () => {
    setIsLoading(true);
    setDevices([]);

    try {
      await BluetoothService.startScanning();

      const unsubscribe = BluetoothService.subscribe((scannedDevices) => {
        setDevices(scannedDevices);
      });

      setIsScanning(true);

      // Stop after 10 seconds
      setTimeout(() => {
        stopScan();
        unsubscribe();
      }, 10000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start Bluetooth scan. Make sure Bluetooth is enabled.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopScan = async () => {
    await BluetoothService.stopScanning();
    setIsScanning(false);
  };

  const sendStatusToBackend = async (detectedIds: string[], notFoundIds: string[]) => {
    try {
      await apiService.updateBluetoothStatus(detectedIds, notFoundIds);
      Alert.alert('Success', 'Animal status updated on server');
      loadAnimals();
    } catch (error) {
      console.error('Error updating Bluetooth status:', error);
    }
  };

  const handleSendStatus = () => {
    const detectedIds = devices
      .filter((d) => d.name && d.name.startsWith('BLE-'))
      .map((d) => d.name);

    const registeredIds = animals.map((a) => a.device_id);
    const notFoundIds = registeredIds.filter((id) => !detectedIds.includes(id));

    sendStatusToBackend(detectedIds, notFoundIds);
  };

  const getSignalIcon = (rssi: number) => {
    if (rssi >= -50) return 'signal-cellular-4';
    if (rssi >= -70) return 'signal-cellular-3';
    if (rssi >= -85) return 'signal-cellular-2';
    return 'signal-cellular-1';
  };

  const getSignalColor = (rssi: number) => {
    if (rssi >= -50) return '#4CAF50';
    if (rssi >= -70) return '#8BC34A';
    if (rssi >= -85) return '#FFC107';
    return '#FF5722';
  };

  const renderDevice = ({ item }: { item: BLEDevice }) => {
    const isAnimal = item.name && item.name.startsWith('BLE-');
    const distance = BluetoothService.calculateDistance(item.rssi);
    const signalColor = getSignalColor(item.rssi);
    const matchingAnimal = animals.find((a) => a.device_id === item.name);

    return (
      <View style={[styles.deviceCard, isAnimal && styles.animalCard]}>
        <View style={styles.deviceInfo}>
          <View style={[styles.deviceIcon, { backgroundColor: signalColor + '20' }]}>
            <Ionicons name="bluetooth" size={20} color={signalColor} />
          </View>
          <View style={styles.deviceDetails}>
            <Text style={styles.deviceName}>
              {item.name || 'Unknown Device'}
              {isAnimal && matchingAnimal && (
                <Text style={styles.animalMatch}> ({matchingAnimal.name})</Text>
              )}
            </Text>
            <Text style={styles.deviceId}>{item.id}</Text>
            <Text style={[styles.distance, { color: signalColor }]}>{distance}</Text>
          </View>
        </View>
        <View style={styles.signalInfo}>
          <Ionicons name={getSignalIcon(item.rssi) as any} size={20} color={signalColor} />
          <Text style={styles.rssiText}>{item.rssi} dBm</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bluetooth Scanner</Text>
        <Text style={styles.subtitle}>Detect animals with BLE trackers</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanButtonActive]}
          onPress={isScanning ? stopScan : startScan}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={isScanning ? 'stop' : 'search'}
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Scanning...' : 'Scan for Animals'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.autoScanRow}>
          <Text style={styles.autoScanText}>Auto-Scan Mode</Text>
          <Switch
            value={autoScan}
            onValueChange={setAutoScan}
            trackColor={{ false: '#3d3d5c', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.devicesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Detected Devices ({devices.length})
          </Text>
          {devices.length > 0 && (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendStatus}>
              <Text style={styles.sendButtonText}>Update Status</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDevice}
          contentContainerStyle={styles.deviceList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bluetooth-outline" size={48} color="#444" />
              <Text style={styles.emptyText}>
                {isScanning ? 'Scanning...' : 'Tap "Scan for Animals" to start'}
              </Text>
            </View>
          }
        />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Signal Strength Guide</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendItem, { borderColor: '#4CAF50' }]}>
            <Text style={styles.legendText}>🟢 Excellent (-50 to 0 dBm)</Text>
          </View>
          <View style={[styles.legendItem, { borderColor: '#8BC34A' }]}>
            <Text style={styles.legendText}>🟢 Good (-50 to -70 dBm)</Text>
          </View>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendItem, { borderColor: '#FFC107' }]}>
            <Text style={styles.legendText}>🟡 Fair (-70 to -85 dBm)</Text>
          </View>
          <View style={[styles.legendItem, { borderColor: '#FF5722' }]}>
            <Text style={styles.legendText}>🟠 Weak (-85+ dBm)</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  controls: {
    padding: 16,
    gap: 16,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanButtonActive: {
    backgroundColor: '#f44336',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  autoScanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    padding: 16,
    borderRadius: 12,
  },
  autoScanText: {
    color: '#fff',
    fontSize: 16,
  },
  devicesSection: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deviceList: {
    gap: 8,
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 12,
  },
  animalCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deviceId: {
    color: '#666',
    fontSize: 10,
    marginTop: 2,
  },
  distance: {
    fontSize: 12,
    marginTop: 2,
  },
  animalMatch: {
    color: '#4CAF50',
    fontSize: 12,
  },
  signalInfo: {
    alignItems: 'flex-end',
  },
  rssiText: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    marginTop: 12,
  },
  legend: {
    padding: 16,
    backgroundColor: '#2d2d44',
  },
  legendTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  legendItem: {
    flex: 1,
    padding: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
  },
  legendText: {
    color: '#888',
    fontSize: 11,
  },
});

