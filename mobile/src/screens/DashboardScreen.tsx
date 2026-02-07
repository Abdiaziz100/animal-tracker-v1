import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import type { Animal, Alert as AlertType } from '../models';
import StatusBadge from '../components/StatusBadge';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [animalsData, alertsData] = await Promise.all([
        apiService.getAnimals(),
        apiService.getAlerts(),
      ]);
      setAnimals(animalsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSimulate = async () => {
    await apiService.simulateMovement();
    loadData();
  };

  const animalsIn = animals.filter((a) => a.status === 'IN').length;
  const animalsOut = animals.filter((a) => a.status === 'OUT').length;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <Text style={styles.statNumber}>{animalsIn}</Text>
          <Text style={styles.statLabel}>In Range</Text>
        </View>
        <View style={[styles.statCard, styles.statCardRed]}>
          <Text style={styles.statNumber}>{animalsOut}</Text>
          <Text style={styles.statLabel}>Out of Range</Text>
        </View>
        <View style={[styles.statCard, styles.statCardBlue]}>
          <Text style={styles.statNumber}>{alerts.length}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={handleSimulate}>
            <Text style={styles.simulateButton}>🎲 Simulate</Text>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active alerts</Text>
          </View>
        ) : (
          alerts.slice(0, 3).map((alert) => (
            <View key={alert.id} style={styles.alertCard}>
              <View style={styles.alertIcon}>
                <Text>{alert.alert_type === 'EXIT' ? '🚨' : '🔋'}</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.animal_name}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {new Date(alert.created_at).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Animals Overview</Text>
        {animals.slice(0, 5).map((animal) => (
          <View key={animal.id} style={styles.animalCard}>
            <View style={styles.animalInfo}>
              <Text style={styles.animalName}>{animal.name}</Text>
              <Text style={styles.animalDevice}>{animal.device_id}</Text>
            </View>
            <StatusBadge status={animal.status} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 16,
    paddingTop: 48,
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
    marginBottom: 24,
  },
  greeting: {
    color: '#888',
    fontSize: 14,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2d2d44',
    borderRadius: 8,
  },
  logoutText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardGreen: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  statCardRed: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  statCardBlue: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  statNumber: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
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
    marginBottom: 12,
  },
  simulateButton: {
    color: '#4CAF50',
    fontSize: 14,
  },
  emptyCard: {
    padding: 24,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  animalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  animalDevice: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});

