from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Animal, Tracking, History, check_geofence, get_geofence, set_geofence

tracking_bp = Blueprint('tracking', __name__)

@tracking_bp.route('/geofence', methods=['GET'])
@jwt_required()
def get_geofence_config():
    """Get current geofence configuration"""
    zone = get_geofence()
    return jsonify({
        'geofence_zone': zone,
        'default_zone': [
            (40.7128, -74.0060),
            (40.7138, -74.0060),
            (40.7138, -74.0050),
            (40.7128, -74.0050),
        ]
    })

@tracking_bp.route('/geofence', methods=['POST'])
@jwt_required()
def set_geofence_config():
    """Set custom geofence configuration"""
    data = request.get_json()
    
    if not data or 'zone' not in data:
        return jsonify({'message': 'No zone data provided'}), 400
    
    zone = data['zone']
    
    # Validate zone is a valid polygon
    if not isinstance(zone, list) or len(zone) < 3:
        return jsonify({'message': 'Geofence must have at least 3 points'}), 400
    
    # Validate each point
    valid_zone = []
    for point in zone:
        if not isinstance(point, (list, tuple)) or len(point) != 2:
            return jsonify({'message': 'Each point must be [lat, lng]'}), 400
        try:
            lat = float(point[0])
            lng = float(point[1])
            if lat < -90 or lat > 90 or lng < -180 or lng > 180:
                return jsonify({'message': 'Invalid coordinates'}), 400
            valid_zone.append((lat, lng))
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid coordinate format'}), 400
    
    # Update geofence
    set_geofence(valid_zone)
    
    # Recheck all animals with new geofence
    animals = Animal.query.all()
    updated_count = 0
    for animal in animals:
        if animal.current_lat and animal.current_lng:
            was_inside = animal.is_inside
            is_inside = check_geofence(animal.current_lat, animal.current_lng)
            if was_inside != is_inside:
                animal.is_inside = is_inside
                animal.status = 'lost' if not is_inside else 'active'
                updated_count += 1
                
                # Create history entry
                history = History(
                    animal_id=animal.id,
                    event_type='exited' if not is_inside else 'entered',
                    description=f'Geofence updated. Animal has {"left" if not is_inside else "entered"} safe zone',
                    latitude=animal.current_lat,
                    longitude=animal.current_lng
                )
                db.session.add(history)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Geofence updated successfully',
        'geofence_zone': valid_zone,
        'animals_updated': updated_count
    })

@tracking_bp.route('/update/<int:animal_id>', methods=['POST'])
@jwt_required()
def update_location(animal_id):
    """Update animal location and check geofence status"""
    current_user_id = get_jwt_identity()
    
    animal = Animal.query.filter_by(id=animal_id, user_id=current_user_id).first()
    
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404
    
    data = request.get_json()
    
    if 'latitude' not in data or 'longitude' not in data:
        return jsonify({'message': 'Latitude and longitude are required'}), 400
    
    latitude = data['latitude']
    longitude = data['longitude']
    signal = data.get('signal_strength', 100)
    
    # Check if inside geofence
    was_inside = animal.is_inside
    is_inside = check_geofence(latitude, longitude)
    
    # Create tracking record
    tracking = Tracking(
        animal_id=animal.id,
        latitude=latitude,
        longitude=longitude,
        speed=data.get('speed'),
        battery_level=data.get('battery_level'),
        signal_strength=signal,
        notes=data.get('notes')
    )
    db.session.add(tracking)
    
    # Update animal location and status
    animal.current_lat = latitude
    animal.current_lng = longitude
    animal.is_inside = is_inside
    animal.signal_strength = signal
    animal.last_seen = datetime.utcnow()
    
    # Check for status change and create history
    if was_inside and not is_inside:
        animal.status = 'lost'
        history = History(
            animal_id=animal.id,
            event_type='exited',
            description=f'Animal "{animal.name}" has exited the safe zone!',
            latitude=latitude,
            longitude=longitude
        )
        db.session.add(history)
    elif not was_inside and is_inside:
        animal.status = 'active'
        history = History(
            animal_id=animal.id,
            event_type='entered',
            description=f'Animal "{animal.name}" has returned to the safe zone',
            latitude=latitude,
            longitude=longitude
        )
        db.session.add(history)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Location updated successfully',
        'animal': {
            'id': animal.id,
            'name': animal.name,
            'current_lat': latitude,
            'current_lng': longitude,
            'is_inside': is_inside,
            'status': animal.status,
            'signal_strength': signal
        }
    })

@tracking_bp.route('/history/<int:animal_id>', methods=['GET'])
@jwt_required()
def get_tracking_history(animal_id):
    """Get tracking history for an animal"""
    current_user_id = get_jwt_identity()
    
    animal = Animal.query.filter_by(id=animal_id, user_id=current_user_id).first()
    
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404
    
    limit = request.args.get('limit', 100)
    
    tracking_records = Tracking.query.filter_by(
        animal_id=animal_id
    ).order_by(Tracking.timestamp.desc()).limit(limit).all()
    
    return jsonify({
        'animal': {
            'id': animal.id,
            'name': animal.name,
            'ear_tag': animal.ear_tag
        },
        'tracking_history': [{
            'id': t.id,
            'latitude': t.latitude,
            'longitude': t.longitude,
            'speed': t.speed,
            'battery_level': t.battery_level,
            'signal_strength': t.signal_strength,
            'timestamp': t.timestamp.isoformat(),
            'notes': t.notes
        } for t in tracking_records]
    })

@tracking_bp.route('/history/all', methods=['GET'])
@jwt_required()
def get_all_history():
    """Get all history events for user's animals"""
    current_user_id = get_jwt_identity()
    
    limit = request.args.get('limit', 100)
    event_type = request.args.get('event_type')
    
    query = History.query.join(Animal).filter(Animal.user_id == current_user_id)
    
    if event_type:
        query = query.filter(History.event_type == event_type)
    
    history_records = query.order_by(History.timestamp.desc()).limit(limit).all()
    
    return jsonify({
        'history': [{
            'id': h.id,
            'animal_id': h.animal_id,
            'animal_name': h.animal.name,
            'event_type': h.event_type,
            'description': h.description,
            'latitude': h.latitude,
            'longitude': h.longitude,
            'timestamp': h.timestamp.isoformat()
        } for h in history_records]
    })

@tracking_bp.route('/simulate', methods=['POST'])
@jwt_required()
def simulate_movement():
    """Simulate random movement for testing purposes"""
    current_user_id = get_jwt_identity()
    
    animals = Animal.query.filter_by(user_id=current_user_id, status='active').all()
    
    import random
    from datetime import datetime
    
    for animal in animals:
        lat_change = random.uniform(-0.001, 0.001)
        lng_change = random.uniform(-0.001, 0.001)
        
        new_lat = (animal.current_lat or 40.7128) + lat_change
        new_lng = (animal.current_lng or -74.0060) + lng_change
        
        was_inside = animal.is_inside
        is_inside = check_geofence(new_lat, new_lng)
        
        signal = random.uniform(50, 100)
        
        tracking = Tracking(
            animal_id=animal.id,
            latitude=new_lat,
            longitude=new_lng,
            speed=random.uniform(0, 5),
            signal_strength=signal
        )
        db.session.add(tracking)
        
        animal.current_lat = new_lat
        animal.current_lng = new_lng
        animal.is_inside = is_inside
        animal.signal_strength = signal
        animal.last_seen = datetime.utcnow()
        
        if was_inside and not is_inside:
            animal.status = 'lost'
            history = History(
                animal_id=animal.id,
                event_type='exited',
                description=f'Animal "{animal.name}" has exited the safe zone!',
                latitude=new_lat,
                longitude=new_lng
            )
            db.session.add(history)
        elif not was_inside and is_inside:
            animal.status = 'active'
            history = History(
                animal_id=animal.id,
                event_type='entered',
                description=f'Animal "{animal.name}" has returned to the safe zone',
                latitude=new_lat,
                longitude=new_lng
            )
            db.session.add(history)
    
    db.session.commit()
    
    return jsonify({
        'message': f'Simulated movement for {len(animals)} animals',
        'updated': len(animals)
    })

@tracking_bp.route('/check/<int:animal_id>', methods=['GET'])
@jwt_required()
def check_status(animal_id):
    """Check current status of an animal"""
    current_user_id = get_jwt_identity()
    
    animal = Animal.query.filter_by(id=animal_id, user_id=current_user_id).first()
    
    if not animal:
        return jsonify({'message': 'Animal not found'}), 404
    
    if animal.current_lat and animal.current_lng:
        is_inside = check_geofence(animal.current_lat, animal.current_lng)
        if is_inside != animal.is_inside:
            animal.is_inside = is_inside
            animal.status = 'active' if is_inside else 'lost'
            db.session.commit()
    
    return jsonify({
        'animal': {
            'id': animal.id,
            'name': animal.name,
            'current_lat': animal.current_lat,
            'current_lng': animal.current_lng,
            'is_inside': animal.is_inside,
            'status': animal.status,
            'signal_strength': animal.signal_strength,
            'last_seen': animal.last_seen.isoformat() if animal.last_seen else None
        }
    })

@tracking_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get all animals outside safe zone"""
    current_user_id = get_jwt_identity()
    
    outside_animals = Animal.query.filter_by(
        user_id=current_user_id, 
        is_inside=False
    ).all()
    
    recent_exits = History.query.join(Animal).filter(
        Animal.user_id == current_user_id,
        History.event_type == 'exited'
    ).order_by(History.timestamp.desc()).limit(10).all()
    
    return jsonify({
        'alerts': [{
            'id': a.id,
            'name': a.name,
            'species': a.species,
            'ear_tag': a.ear_tag,
            'last_lat': a.current_lat,
            'last_lng': a.current_lng,
            'last_seen': a.last_seen.isoformat() if a.last_seen else None,
            'signal_strength': a.signal_strength
        } for a in outside_animals],
        'recent_exits': [{
            'id': h.id,
            'animal_name': h.animal.name,
            'timestamp': h.timestamp.isoformat(),
            'description': h.description
        } for h in recent_exits],
        'total_outside': len(outside_animals)
    })

