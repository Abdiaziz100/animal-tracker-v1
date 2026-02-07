import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'IN' | 'OUT';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isIn = status === 'IN';

  return (
    <View
      style={[
        styles.badge,
        isIn ? styles.badgeIn : styles.badgeOut,
      ]}
    >
      <View style={[styles.dot, isIn ? styles.dotIn : styles.dotOut]} />
      <Text style={[styles.text, isIn ? styles.textIn : styles.textOut]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeIn: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badgeOut: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotIn: {
    backgroundColor: '#4CAF50',
  },
  dotOut: {
    backgroundColor: '#f44336',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textIn: {
    color: '#4CAF50',
  },
  textOut: {
    color: '#f44336',
  },
});

