
# Pytest Fixtures for Animal Tracker Tests

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db
from models import User, Animal, Geofence, Alert


@pytest.fixture(scope='session')
def application():
    """Create application for testing"""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture(scope='function')
def client(application):
    """Create test client"""
    return application.test_client()


@pytest.fixture(scope='function')
def db_session(application):
    """Create database session for testing"""
    with application.app_context():
        db.create_all()
        yield db
        db.session.rollback()
        for table in reversed(db.metadata.sorted_tables):
            db.session.execute(table.delete())
        db.session.commit()


@pytest.fixture
def sample_user(db_session):
    """Create sample user"""
    user = User(
        email='test@example.com',
        password='testpass123',
        name='Test User'
    )
    db_session.session.add(user)
    db_session.session.commit()
    return user


@pytest.fixture
def sample_animal(db_session, sample_user):
    """Create sample animal"""
    animal = Animal(
        name='Test Cow',
        device_id='BLE-001',
        ear_tag='ET-001',
        species='cattle',
        lat=-1.2921,
        lng=36.8219,
        status='IN',
        user_id=sample_user.id
    )
    db_session.session.add(animal)
    db_session.session.commit()
    return animal


@pytest.fixture
def auth_token(client, sample_user):
    """Get authentication token (for future JWT tests)"""
    response = client.post('/api/login', json={
        'email': 'test@example.com',
        'password': 'testpass123'
    })
    return response.get_json()

