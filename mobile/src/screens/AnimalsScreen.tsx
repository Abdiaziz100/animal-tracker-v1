import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import type { Animal } from '../models';
import StatusBadge from '../components/StatusBadge';

export default function AnimalsScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newAnimal, setNewAnimal] = useState({
    name: '',
    device_id: '',
    ear_tag: '',
    species: 'cattle',
  });

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      const data = await apiService.getAnimals();
      setAnimals(data);
    } catch (error) {
      console.error('Error loading animals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals();
    setRefreshing(false);
  };

  const handleAddAnimal = async () => {
    if (!newAnimal.name || !newAnimal.device_id) {
      Alert.alert('Error', 'Please fill in name and device ID');
      return;
    }

    try {
      const response = await apiService.createAnimal(newAnimal);
      if (response.success) {
        setModalVisible(false);
        setNewAnimal({ name: '', device_id: '', ear_tag: '', species: 'cattle' });
        loadAnimals();
        Alert.alert('Success', 'Animal added successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to add animal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add animal');
    }
  };

  const renderAnimal = ({ item }: { item: Animal }) => (
    <View style={styles.animalCard}>
      <View style={styles.animalHeader}>
        <View style={styles.animalIcon}>
          <Text style={styles.animalIconText}>
            {item.species === 'cattle' ? '🐄' : item.species === 'sheep' ? '🐑' : '🐐'}
          </Text>
        </View>
        <View style={styles.animalInfo}>
          <Text style={styles.animalName}>{item.name}</Text>
          <Text style={styles.animalDetails}>ID: {item.device_id}</Text>
          {item.ear_tag && <Text style={styles.animalDetails}>Tag: {item.ear_tag}</Text>}
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.animalStats}>
        <View style={styles.stat}>
          <Ionicons name="battery-full" size={16} color="#4CAF50" />
          <Text style={styles.statText}>{Math.round(item.battery_level)}%</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="wifi" size={16} color="#2196F3" />
          <Text style={styles.statText}>{Math.round(item.signal_strength)}%</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="location" size={16} color="#ff6b6b" />
          <Text style={styles.statText}>
            {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
          </Text>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.title}>Animals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={animals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAnimal}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No animals registered yet</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyButtonText}>Add Your First Animal</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Animal</Text>

            <TextInput
              style={styles.input}
              placeholder="Animal Name"
              placeholderTextColor="#888"
              value={newAnimal.name}
              onChangeText={(text) => setNewAnimal({ ...newAnimal, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Device ID (e.g., BLE-001)"
              placeholderTextColor="#888"
              value={newAnimal.device_id}
              onChangeText={(text) => setNewAnimal({ ...newAnimal, device_id: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Ear Tag (optional)"
              placeholderTextColor="#888"
              value={newAnimal.ear_tag}
              onChangeText={(text) => setNewAnimal({ ...newAnimal, ear_tag: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Species (cattle, sheep, goat)"
              placeholderTextColor="#888"
              value={newAnimal.species}
              onChangeText={(text) => setNewAnimal({ ...newAnimal, species: text })}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleAddAnimal}>
                <Text style={styles.submitButtonText}>Add Animal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  animalCard: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 16,
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  animalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3d3d5c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  animalIconText: {
    fontSize: 24,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  animalDetails: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  animalStats: {
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
    color: '#888',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#3d3d5c',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

