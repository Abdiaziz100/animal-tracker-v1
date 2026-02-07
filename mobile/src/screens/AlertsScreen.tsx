import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import type { Alert as AlertType } from '../models';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleMarkRead = async (alertId: number) => {
    try {
      await apiService.markAlertRead(alertId);
      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(alerts.map((alert) => apiService.markAlertRead(alert.id)));
      setAlerts([]);
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'EXIT':
        return { icon: 'warning', color: '#f44336' };
      case 'LOW_BATTERY':
        return { icon: 'battery-alert', color: '#ff9800' };
      default:
        return { icon: 'notifications', color: '#2196F3' };
    }
  };

  const renderAlert = ({ item }: { item: AlertType }) => {
    const { icon, color } = getAlertIcon(item.alert_type);

    return (
      <View style={[styles.alertCard, { borderLeftColor: color }]}>
        <View style={[styles.alertIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>{item.animal_name}</Text>
            <Text style={[styles.alertType, { color }]}>{item.alert_type}</Text>
          </View>
          <Text style={styles.alertMessage}>{item.message}</Text>
          <Text style={styles.alertTime}>
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => handleMarkRead(item.id)}
        >
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>{alerts.length} unread alerts</Text>
        </View>
        {alerts.length > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#444" />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptyText}>All animals are safe within the geofence</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
  },
  markAllText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  alertType: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  alertTime: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  dismissButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
});

