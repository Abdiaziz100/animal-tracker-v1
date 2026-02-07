import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BLEDevice } from '../services/bluetooth';

interface BluetoothDeviceCardProps {
  device: BLEDevice;
  onPress?: () => void;
  isAnimal?: boolean;
  animalName?: string;
}

export default function BluetoothDeviceCard({
  device,
  onPress,
  isAnimal = false,
  animalName,
}: BluetoothDeviceCardProps) {
  const getSignalStrength = (rssi: number) => {
    if (rssi >= -50) return { level: 'Excellent', color: '#4CAF50', icon: 'cellular-4' };
    if (rssi >= -70) return { level: 'Good', color: '#8BC34A', icon: 'cellular-3' };
    if (rssi >= -85) return { level: 'Fair', color: '#FFC107', icon: 'cellular-2' };
    return { level: 'Weak', color: '#FF5722', icon: 'cellular-1' };
  };

  const calculateDistance = (rssi: number): string => {
    const txPower = -59;
    const distance = Math.pow(10, (txPower - rssi) / (10 * 2.5));
    if (distance < 1) return '< 1m';
    if (distance < 10) return `${Math.round(distance)}m`;
    if (distance < 100) return `${Math.round(distance)}m`;
    return '> 100m';
  };

  const signal = getSignalStrength(device.rssi);
  const distance = calculateDistance(device.rssi);

  const content = (
    <View style={[styles.card, isAnimal && styles.animalCard]}>
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: signal.color + '20' }]}>
          <Ionicons name="bluetooth" size={20} color={signal.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>
            {device.name || 'Unknown Device'}
            {isAnimal && animalName && (
              <Text style={styles.animalMatch}> ({animalName})</Text>
            )}
          </Text>
          <Text style={styles.id}>{device.id}</Text>
        </View>
        <View style={styles.signalBadge}>
          <Ionicons name={signal.icon as any} size={16} color={signal.color} />
          <Text style={[styles.signalText, { color: signal.color }]}>{signal.level}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.stat}>
          <Ionicons name="locate" size={14} color="#888" />
          <Text style={styles.statText}>{distance}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.rssiText}>{device.rssi} dBm</Text>
        </View>
        {isAnimal && (
          <View style={[styles.statusBadge, { backgroundColor: signal.color + '20' }]}>
            <Text style={[styles.statusText, { color: signal.color }]}>
              In Range
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  animalCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  id: {
    color: '#666',
    fontSize: 10,
  },
  animalMatch: {
    color: '#4CAF50',
    fontSize: 12,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3d3d5c',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#888',
    fontSize: 12,
  },
  rssiText: {
    color: '#666',
    fontSize: 11,
  },
  statusBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

