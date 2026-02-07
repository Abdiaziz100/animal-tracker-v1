import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Animal } from '../models';
import StatusBadge from './StatusBadge';

interface AnimalCardProps {
  animal: Animal;
  onPress?: () => void;
}

export default function AnimalCard({ animal, onPress }: AnimalCardProps) {
  const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
      case 'cattle':
        return '�';
      case 'sheep':
        return '🐑';
      case 'goat':
        return '🐐';
      case 'horse':
        return '🐴';
      default:
        return '🐄';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#4CAF50';
    if (level > 20) return '#FFC107';
    return '#f44336';
  };

  const content = (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.speciesIcon}>{getSpeciesIcon(animal.species)}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{animal.name}</Text>
          <Text style={styles.deviceId}>{animal.device_id}</Text>
          {animal.ear_tag && <Text style={styles.earTag}>Tag: {animal.ear_tag}</Text>}
        </View>
        <StatusBadge status={animal.status} />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="battery-full" size={16} color={getBatteryColor(animal.battery_level)} />
          <Text style={[styles.statText, { color: getBatteryColor(animal.battery_level) }]}>
            {Math.round(animal.battery_level)}%
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="wifi" size={16} color="#2196F3" />
          <Text style={styles.statText}>{Math.round(animal.signal_strength)}%</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="location-outline" size={16} color="#888" />
          <Text style={styles.locationText}>
            {animal.lat.toFixed(4)}, {animal.lng.toFixed(4)}
          </Text>
        </View>
      </View>

      {animal.last_seen && (
        <Text style={styles.lastSeen}>
          Last seen: {new Date(animal.last_seen).toLocaleString()}
        </Text>
      )}
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3d3d5c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  speciesIcon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  deviceId: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  earTag: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3d3d5c',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  locationText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  lastSeen: {
    color: '#666',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
});

