
# Authentication Tests

import pytest
from models import User


class TestAuth:
    """Test authentication endpoints"""
    
    def test_login_success(self, client, sample_user):
        """Test successful login"""
        response = client.post('/api/login', json={
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'user' in data
    
    def test_login_invalid_credentials(self, client, sample_user):
        """Test login with invalid credentials"""
        response = client.post('/api/login', json={
            'email': 'test@example.com',
            'password': 'wrongpassword'
        })
        
        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
    
    def test_login_missing_fields(self, client):
        """Test login with missing fields"""
        response = client.post('/api/login', json={
            'email': 'test@example.com'
        })
        
        assert response.status_code == 400
    
    def test_register_success(self, client):
        """Test successful registration"""
        response = client.post('/api/register', json={
            'email': 'newuser@example.com',
            'password': 'password123',
            'name': 'New User'
        })
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
    
    def test_register_duplicate_email(self, client, sample_user):
        """Test registration with duplicate email"""
        response = client.post('/api/register', json={
            'email': 'test@example.com',
            'password': 'password123',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
    
    def test_register_short_password(self, client):
        """Test registration with short password"""
        response = client.post('/api/register', json={
            'email': 'user@example.com',
            'password': '123',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
    
    def test_invalid_email_format(self, client):
        """Test registration with invalid email"""
        response = client.post('/api/register', json={
            'email': 'invalid-email',
            'password': 'password123',
            'name': 'Test User'
        })
        
        assert response.status_code == 400

