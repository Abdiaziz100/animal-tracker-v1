from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Animal, History

animals_bp = Blueprint('animals', __name__)

@animals_bp.route('', methods=['GET'])
@jwt_required()
def get_animals():
    current_user_id = get_jwt_identity()
    user_id = request.args.get('user_id', current_user_id)
    
    animals = Animal.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'animals': [{
            'id': a.id,
            'name': a.name,
            'species': a.species,
            'ear_tag': a.ear_tag,
            'breed': a.breed,
            'age': a.age,
            'gender': a.gender,
            'weight': a.weight,
            'color': a.color,
            'status': a.status,
            'current_lat': a.current_lat,
            'current_lng': a.current_lng,
            'is_inside': a.is_inside,
            'created_at': a.created_at.isoformat()
        } for a in animals]
    })

@animals_bp.route('/<int:animal_id>', methods=['GET'])
@jwt_required()
def get_animal(animal_id):
    current_user_id = get_jwt_identity()
    
    animal = Animal.query.filter_by(id=animal_id, user_id=current_user_id).first()
    
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404
    
    # Get tracking history
    tracking_history = animal.tracking[:10]  # Last 10 records
    
    return jsonify({
        'animal': {
            'id': animal.id,
            'name': animal.name,
            'species': animal.species,
            'ear_tag': animal.ear_tag,
            'breed': animal.breed,
            'age': animal.age,
            'gender': animal.gender,
            'weight': animal.weight,
            'color': animal.color,
            'status': animal.status,
            'current_lat': animal.current_lat,
            'current_lng': animal.current_lng,
            'is_inside': animal.is_inside,
            'created_at': animal.created_at.isoformat()
        },
        'tracking_history': [{
            'id': t.id,
            'latitude': t.latitude,
            'longitude': t.longitude,
            'speed': t.speed,
            'battery_level': t.battery_level,
            'timestamp': t.timestamp.isoformat(),
            'notes': t.notes
        } for t in tracking_history]
    })

@animals_bp.route('', methods=['POST'])
@jwt_required()
def create_animal():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    required_fields = ['name', 'species', 'ear_tag']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Missing required field: {field}'}), 400
    
    # Check if ear_tag already exists
    if Animal.query.filter_by(ear_tag=data['ear_tag']).first():
        return jsonify({'message': 'Ear tag already exists'}), 400
    
    animal = Animal(
        name=data['name'],
        species=data['species'],
        ear_tag=data['ear_tag'],
        breed=data.get('breed'),
        age=data.get('age'),
        gender=data.get('gender'),
        weight=data.get('weight'),
        color=data.get('color'),
        status=data.get('status', 'active'),
        user_id=current_user_id
    )
    
    db.session.add(animal)
    db.session.commit()
    
    # Create history entry
    history = History(
        animal_id=animal.id,
        event_type='added',
        description=f'Animal "{animal.name}" was added to the system',
        latitude=data.get('current_lat'),
        longitude=data.get('current_lng')
    )
    db.session.add(history)
    db.session.commit()
    
    return jsonify({
        'message': 'Animal created successfully',
        'animal': {
            'id': animal.id,
            'name': animal.name,
            'species': animal.species,
            'ear_tag': animal.ear_tag
        }
    }), 201

@animals_bp.route('/<int:animal_id>', methods=['PUT'])
@jwt_required()
def update_animal(animal_id):
    current_user_id = get_jwt_identity()
    
    animal = Animal.query.filter_by(id=animal_id, user_id=current_user_id).first()
    
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    updatable_fields = ['name', 'species', 'ear_tag', 'breed', 'age', 'gender', 
                        'weight', 'color', 'status']
    
    for field in updatable_fields:
        if field in data:
            setattr(animal, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Animal updated successfully',
        'animal': {
            'id': animal.id,
            'name': animal.name,
            'species': animal.species,
            'ear_tag': animal.ear_tag
        }
    })

@animals_bp.route('/<int:animal_id>', methods=['DELETE'])
@jwt_required()
def delete_animal(animal_id):
    current_user_id = get_jwt_identity()
    
    animal = Animal.query.filter_by(id=animal_id, user_id=current_user_id).first()
    
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404
    
    animal_name = animal.name
    
    db.session.delete(animal)
    db.session.commit()
    
    return jsonify({
        'message': f'Animal "{animal_name}" deleted successfully'
    })

