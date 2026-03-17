
# Animal Tests

import pytest
from models import Animal


class TestAnimals:
    """Test animal management endpoints"""
    
    def test_get_animals_empty(self, client):
        """Test getting animals when database is empty"""
        response = client.get('/api/animals')
        
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
    
    def test_create_animal_success(self, client, sample_user):
        """Test successful animal creation"""
        response = client.post('/api/animals', json={
            'name': 'Bessie',
            'device_id': 'BLE-TEST-001',
            'ear_tag': 'ET-TEST-001',
            'species': 'cattle'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['animal']['name'] == 'Bessie'
    
    def test_create_animal_duplicate_device_id(self, client, sample_animal):
        """Test creating animal with duplicate device ID"""
        response = client.post('/api/animals', json={
            'name': 'Another Cow',
            'device_id': 'BLE-001',  # Already exists
            'ear_tag': 'ET-TEST-002',
            'species': 'cattle'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_create_animal_duplicate_ear_tag(self, client, sample_animal):
        """Test creating animal with duplicate ear tag"""
        response = client.post('/api/animals', json={
            'name': 'Another Cow',
            'device_id': 'BLE-TEST-002',
            'ear_tag': 'ET-001',  # Already exists
            'species': 'cattle'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_get_animal_by_id(self, client, sample_animal):
        """Test getting specific animal"""
        response = client.get(f'/api/animals/{sample_animal.id}')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['name'] == sample_animal.name
        assert data['device_id'] == sample_animal.device_id
    
    def test_update_animal(self, client, sample_animal):
        """Test updating animal"""
        response = client.put(f'/api/animals/{sample_animal.id}', json={
            'name': 'Updated Name',
            'species': 'goat'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
    
    def test_delete_animal(self, client, sample_animal):
        """Test deleting animal"""
        animal_id = sample_animal.id
        response = client.delete(f'/api/animals/{animal_id}')
        
        assert response.status_code == 200
        
        # Verify deletion
        response = client.get(f'/api/animals/{animal_id}')
        assert response.status_code == 404
    
    def test_gps_update(self, client, sample_animal):
        """Test GPS update endpoint"""
        response = client.post('/api/gps', json={
            'device_id': 'BLE-001',
            'lat': -1.2921,
            'lng': 36.8219,
            'battery': 85,
            'signal': -70
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['animal']['status'] == 'IN'
    
    def test_gps_update_outside_geofence(self, client, sample_animal):
        """Test GPS update when animal is outside geofence"""
        response = client.post('/api/gps', json={
            'device_id': 'BLE-001',
            'lat': -1.3500,  # Far from farm center
            'lng': 36.9000,
            'battery': 85
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['animal']['status'] == 'OUT'
    
    def test_gps_invalid_device_id(self, client):
        """Test GPS update with invalid device ID"""
        response = client.post('/api/gps', json={
            'device_id': 'INVALID-999',
            'lat': -1.2921,
            'lng': 36.8219
        })
        
        assert response.status_code == 404

