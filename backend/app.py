from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from functools import wraps
import math
import os
import re
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# CORS configuration
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Rate Limiting configuration
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

# Simple in-memory cache
cache = {}

def cache_response(key, data, ttl=60):
    """Store response in cache with TTL in seconds"""
    import time
    cache[key] = {
        'data': data,
        'expires': time.time() + ttl
    }

def get_cached(key):
    """Get cached response if not expired"""
    import time
    if key in cache:
        if cache[key]['expires'] > time.time():
            return cache[key]['data']
        else:
            del cache[key]
    return None

def clear_cache():
    """Clear all cached responses"""
    cache.clear()

# Background Scheduler for periodic tasks
from apscheduler.schedulers.background import BackgroundScheduler
scheduler = BackgroundScheduler()
scheduler.start()

# ============ VALIDATION HELPERS ============

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, str(email)) is not None

def validate_required_fields(data, fields):
    """Validate required fields exist"""
    missing = [f for f in fields if not data.get(f)]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
    return True, None

def sanitize_input(value, max_length=255):
    """Sanitize string input"""
    if value:
        value = str(value).strip()[:max_length]
        value = re.sub(r'[<>"\']', '', value)
    return value

def validate_lat_lng(lat, lng):
    """Validate latitude and longitude"""
    try:
        lat = float(lat)
        lng = float(lng)
        if -90 <= lat <= 90 and -180 <= lng <= 180:
            return True, None
        return False, "Invalid coordinates"
    except (ValueError, TypeError):
        return False, "Invalid coordinate format"

# ============ ERROR HANDLERS ============

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"success": False, "message": "Bad request"}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"success": False, "message": "Internal server error"}), 500

# Database configuration
# Use DATABASE_URL from environment (Render) or fallback to absolute path
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # Use the provided database URL (production)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Use absolute path for local SQLite database
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'tracker.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy AFTER configuring the URI
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)

# ============ MODELS ============

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(120))
    name = db.Column(db.String(100))

class Animal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    device_id = db.Column(db.String(100), unique=True, nullable=False, index=True)  # Indexed
    ear_tag = db.Column(db.String(50), unique=True, index=True)  # Indexed
    species = db.Column(db.String(50))
    lat = db.Column(db.Float, default=0)
    lng = db.Column(db.Float, default=0)
    status = db.Column(db.String(10), default="IN", index=True)  # Indexed
    battery_level = db.Column(db.Float, default=100)
    signal_strength = db.Column(db.Float, default=100)
    last_seen = db.Column(db.DateTime, index=True)  # Indexed
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Geofence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)  # Indexed
    center_lat = db.Column(db.Float, default=-1.2921)
    center_lng = db.Column(db.Float, default=36.8219)
    radius_km = db.Column(db.Float, default=0.5)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'), index=True)  # Indexed
    alert_type = db.Column(db.String(20), index=True)  # Indexed
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)  # Indexed
    is_read = db.Column(db.Boolean, default=False, index=True)  # Indexed
    animal = db.relationship('Animal', backref='alerts')

# Create tables and default data
with app.app_context():
    db.create_all()
    
    # Create default admin user if not exists
    if not User.query.filter_by(email='admin@farm.com').first():
        admin = User(email='admin@farm.com', password='admin123', name='Admin User')
        db.session.add(admin)
        db.session.commit()
        print("Default admin user created: admin@farm.com / admin123")
    
    # Create default geofence if not exists
    if not Geofence.query.first():
        default_geo = Geofence(center_lat=-1.2921, center_lng=36.8219, radius_km=0.5)
        db.session.add(default_geo)
        db.session.commit()
        print("Default geofence created")

# Farm center coordinates
FARM_CENTER_LAT = -1.2921
FARM_CENTER_LNG = 36.8219
FARM_RADIUS_KM = 0.5

def check_geofence(lat, lng):
    try:
        R = 6371
        lat1_rad = math.radians(FARM_CENTER_LAT)
        lat2_rad = math.radians(lat)
        delta_lat = math.radians(lat - FARM_CENTER_LAT)
        delta_lng = math.radians(lng - FARM_CENTER_LNG)
        a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c
        return "IN" if distance <= FARM_RADIUS_KM else "OUT"
    except:
        return "IN"

# ============ AUTH ROUTES ============

@app.route("/api/login", methods=["POST"])
@limiter.limit("5 per minute")  # Rate limit login attempts
def login():
    # Validate request has JSON data
    if not request.json:
        return jsonify({"success": False, "message": "Request body required"}), 400
    
    data = request.json
    
    # Validate required fields
    valid, error = validate_required_fields(data, ['email', 'password'])
    if not valid:
        return jsonify({"success": False, "message": error}), 400
    
    # Sanitize inputs
    email = sanitize_input(data.get('email', ''), 120)
    password = data.get('password', '')
    
    # Validate email format
    if not validate_email(email):
        return jsonify({"success": False, "message": "Invalid email format"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if user and user.password == password:
        logger.info(f"Successful login for user: {email}")
        return jsonify({
            "success": True,
            "user": {"id": user.id, "email": user.email, "name": user.name}
        })
    
    logger.warning(f"Failed login attempt for email: {email}")
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route("/api/register", methods=["POST"])
@limiter.limit("3 per minute")  # Rate limit registration
def register():
    # Validate request has JSON data
    if not request.json:
        return jsonify({"success": False, "message": "Request body required"}), 400
    
    data = request.json
    
    # Validate required fields
    valid, error = validate_required_fields(data, ['email', 'password', 'name'])
    if not valid:
        return jsonify({"success": False, "message": error}), 400
    
    # Sanitize inputs
    email = sanitize_input(data.get('email', ''), 120)
    password = data.get('password', '')
    name = sanitize_input(data.get('name', ''), 100)
    
    # Validate email format
    if not validate_email(email):
        return jsonify({"success": False, "message": "Invalid email format"}), 400
    
    # Validate password length
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already exists"}), 400
    
    user = User(email=email, password=password, name=name)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"success": True, "user": {"id": user.id, "email": user.email, "name": user.name}})

# ============ ANIMAL ROUTES ============

@app.route("/api/animals", methods=["GET", "POST"])
def animals():
    if request.method == "POST":
        data = request.json or {}
        
        device_id = data.get("device_id", "")
        ear_tag = data.get("ear_tag", "")
        
        # Check if device_id (BLE) already registered
        if device_id and Animal.query.filter_by(device_id=device_id).first():
            return jsonify({"success": False, "message": "BLE Device ID already in use by another animal"}), 400
        
        # Check if ear_tag already registered
        if ear_tag and Animal.query.filter_by(ear_tag=ear_tag).first():
            return jsonify({"success": False, "message": "Ear Tag number already in use by another animal"}), 400
        
        # Create animal
        animal = Animal(
            name=data.get("name", ""),
            device_id=data.get("device_id", ""),
            ear_tag=data.get("ear_tag"),
            species=data.get("species", "cattle"),
            lat=FARM_CENTER_LAT,
            lng=FARM_CENTER_LNG,
            status="IN"
        )
        db.session.add(animal)
        db.session.commit()
        
        # Clear cache when data changes
        clear_cache()
        
        return jsonify({
            "success": True,
            "animal": {
                "id": animal.id,
                "name": animal.name,
                "device_id": animal.device_id,
                "lat": animal.lat,
                "lng": animal.lng,
                "status": animal.status
            }
        })
    
    # GET request - return all animals (with caching)
    cache_key = "animals_list"
    cached_data = get_cached(cache_key)
    if cached_data:
        return jsonify(cached_data)
    
    animals_list = Animal.query.all()
    result = [{
        "id": a.id,
        "name": a.name,
        "device_id": a.device_id,
        "ear_tag": a.ear_tag,
        "species": a.species,
        "lat": a.lat,
        "lng": a.lng,
        "status": a.status,
        "battery_level": a.battery_level,
        "signal_strength": a.signal_strength,
        "last_seen": a.last_seen.isoformat() if a.last_seen else None
    } for a in animals_list]
    
    # Cache for 30 seconds
    cache_response(cache_key, result, ttl=30)
    
    return jsonify(result)

@app.route("/api/animals/<int:id>", methods=["GET", "PUT", "DELETE"])
def animal_detail(id):
    animal = Animal.query.get_or_404(id)
    
    if request.method == "GET":
        # Check cache
        cache_key = f"animal_{id}"
        cached_data = get_cached(cache_key)
        if cached_data:
            return jsonify(cached_data)
        
        result = {
            "id": animal.id,
            "name": animal.name,
            "device_id": animal.device_id,
            "ear_tag": animal.ear_tag,
            "species": animal.species,
            "lat": animal.lat,
            "lng": animal.lng,
            "status": animal.status,
            "battery_level": animal.battery_level,
            "signal_strength": animal.signal_strength
        }
        cache_response(cache_key, result, ttl=30)
        return jsonify(result)
    
    if request.method == "PUT":
        data = request.json or {}
        
        new_device_id = data.get("device_id")
        new_ear_tag = data.get("ear_tag")
        
        # Check if new device_id (BLE) is already used by another animal
        if new_device_id and new_device_id != animal.device_id:
            if Animal.query.filter(Animal.device_id == new_device_id, Animal.id != animal.id).first():
                return jsonify({"success": False, "message": "BLE Device ID already in use by another animal"}), 400
        
        # Check if new ear_tag is already used by another animal
        if new_ear_tag and new_ear_tag != animal.ear_tag:
            if Animal.query.filter(Animal.ear_tag == new_ear_tag, Animal.id != animal.id).first():
                return jsonify({"success": False, "message": "Ear Tag number already in use by another animal"}), 400
        
        animal.name = data.get("name", animal.name)
        animal.ear_tag = data.get("ear_tag", animal.ear_tag)
        animal.species = data.get("species", animal.species)
        if new_device_id:
            animal.device_id = new_device_id
        db.session.commit()
        
        # Clear cache
        clear_cache()
        
        return jsonify({"success": True})
    
    if request.method == "DELETE":
        db.session.delete(animal)
        db.session.commit()
        
        # Clear cache
        clear_cache()
        
        return jsonify({"success": True})

# ============ GPS / TRACKING ROUTES ============

@app.route("/api/gps", methods=["POST"])
@limiter.limit("30 per minute")  # Rate limit GPS updates
def gps_update():
    # Validate request has JSON data
    if not request.json:
        return jsonify({"success": False, "message": "Request body required"}), 400
    
    data = request.json
    
    # Validate required fields
    valid, error = validate_required_fields(data, ['device_id'])
    if not valid:
        return jsonify({"success": False, "message": error}), 400
    
    device_id = sanitize_input(data.get('device_id', ''), 100)
    
    # Validate device_id format (alphanumeric and hyphens only)
    if not re.match(r'^[a-zA-Z0-9\-_]+$', device_id):
        return jsonify({"success": False, "message": "Invalid device ID format"}), 400
    
    # Validate coordinates if provided
    if 'lat' in data or 'lng' in data:
        valid, error = validate_lat_lng(data.get('lat', 0), data.get('lng', 0))
        if not valid:
            return jsonify({"success": False, "message": error}), 400
    
    animal = Animal.query.filter_by(device_id=device_id).first()
    
    if not animal:
        return jsonify({"success": False, "message": "Device not registered"}), 404
    
    old_status = animal.status
    
    animal.lat = data.get("lat", animal.lat)
    animal.lng = data.get("lng", animal.lng)
    animal.battery_level = data.get("battery", animal.battery_level)
    animal.signal_strength = data.get("signal", animal.signal_strength)
    animal.last_seen = datetime.utcnow()
    
    new_status = check_geofence(animal.lat, animal.lng)
    animal.status = new_status
    
    if old_status == "IN" and new_status == "OUT":
        logger.warning(f"ALERT: {animal.name} (ID: {animal.id}) has left the farm boundary!")
        alert = Alert(
            animal_id=animal.id,
            alert_type="EXIT",
            message=f"ALERT: {animal.name} has LEFT the farm boundary!"
        )
        db.session.add(alert)
    
    if data.get("battery", 100) < 20:
        logger.warning(f"LOW BATTERY: {animal.name} battery at {data.get('battery')}%")
        alert = Alert(
            animal_id=animal.id,
            alert_type="LOW_BATTERY",
            message=f"LOW BATTERY: {animal.name} has {data.get('battery')}%"
        )
        db.session.add(alert)
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "animal": {
            "id": animal.id,
            "name": animal.name,
            "status": animal.status,
            "lat": animal.lat,
            "lng": animal.lng
        }
    })

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    # Check cache first
    cache_key = "alerts_list"
    cached_data = get_cached(cache_key)
    if cached_data:
        return jsonify(cached_data)
    
    alerts = Alert.query.filter_by(is_read=False).order_by(Alert.created_at.desc()).all()
    result = [{
        "id": a.id,
        "animal_id": a.animal_id,
        "animal_name": a.animal.name if a.animal else "Unknown",
        "alert_type": a.alert_type,
        "message": a.message,
        "created_at": a.created_at.isoformat()
    } for a in alerts]
    
    # Cache for 15 seconds
    cache_response(cache_key, result, ttl=15)
    
    return jsonify(result)

@app.route("/api/alerts/<int:id>/read", methods=["POST"])
def mark_alert_read(id):
    alert = Alert.query.get_or_404(id)
    alert.is_read = True
    db.session.commit()
    
    # Clear cache when data changes
    clear_cache()
    
    return jsonify({"success": True})

# ============ GEOFENCE ROUTES ============

@app.route("/api/geofence", methods=["GET", "POST"])
def geofence():
    if request.method == "POST":
        data = request.json or {}
        geo = Geofence.query.first()
        if not geo:
            geo = Geofence()
            db.session.add(geo)
        
        geo.center_lat = data.get("lat", -1.2921)
        geo.center_lng = data.get("lng", 36.8219)
        geo.radius_km = data.get("radius", 0.5)
        db.session.commit()
        
        return jsonify({"success": True, "geofence": {
            "lat": geo.center_lat,
            "lng": geo.center_lng,
            "radius": geo.radius_km
        }})
    
    geo = Geofence.query.first()
    return jsonify({
        "lat": geo.center_lat if geo else -1.2921,
        "lng": geo.center_lng if geo else 36.8219,
        "radius": geo.radius_km if geo else 0.5
    })

# ============ SIMULATION ============

@app.route("/api/simulate/movement", methods=["POST"])
def simulate_movement():
    import random
    
    animals = Animal.query.all()
    exited_count = 0
    
    for animal in animals:
        old_status = animal.status
        
        lat_change = random.uniform(-0.001, 0.001)
        lng_change = random.uniform(-0.001, 0.001)
        
        animal.lat = max(-90, min(90, animal.lat + lat_change))
        animal.lng = max(-180, min(180, animal.lng + lng_change))
        animal.last_seen = datetime.utcnow()
        animal.status = check_geofence(animal.lat, animal.lng)
        
        if old_status == "IN" and animal.status == "OUT":
            exited_count += 1
            alert = Alert(
                animal_id=animal.id,
                alert_type="EXIT",
                message=f"ALERT: {animal.name} has LEFT the farm boundary!"
            )
            db.session.add(alert)
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Simulated movement for {len(animals)} animals",
        "exited": exited_count
    })

# ============ API VERSION ============

@app.route("/api/version", methods=["GET"])
def api_version():
    """API version information"""
    return jsonify({
        "version": "1.0.0",
        "api_name": "Animal Tracker API",
        "deprecated": False,
        "endpoints": {
            "auth": ["/api/login", "/api/register"],
            "animals": ["/api/animals", "/api/animals/<id>"],
            "tracking": ["/api/gps", "/api/alerts", "/api/geofence"],
            "bluetooth": ["/api/bluetooth/status", "/api/animals/ble-status"],
            "system": ["/api/health", "/api/version", "/api/simulate/movement"]
        }
    })

@app.route("/api/health", methods=["GET"])
def health():
    """Health check with system info"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "scheduler_running": scheduler.running
    })

# ============ BLUETOOTH STATUS ROUTES ============

@app.route("/api/bluetooth/status", methods=["POST"])
def bluetooth_status():
    """Update animal status based on Bluetooth detection from mobile app"""
    data = request.json or {}
    device_ids = data.get("device_ids", [])
    not_found_ids = data.get("not_found_ids", [])
    
    updated = []
    
    # Mark detected animals as IN
    for device_id in device_ids:
        animal = Animal.query.filter_by(device_id=device_id).first()
        if animal:
            animal.status = "IN"
            animal.last_seen = datetime.utcnow()
            updated.append(device_id)
    
    # Mark not-found animals as OUT (potential escape)
    for device_id in not_found_ids:
        animal = Animal.query.filter_by(device_id=device_id).first()
        if animal and animal.status != "OUT":
            animal.status = "OUT"
            
            # Create exit alert
            alert = Alert(
                animal_id=animal.id,
                alert_type="EXIT",
                message=f"ALERT: {animal.name} is out of Bluetooth range! (May have escaped)"
            )
            db.session.add(alert)
            updated.append(device_id)
    
    db.session.commit()
    
    return jsonify({
        "success": True,
        "updated": updated,
        "message": f"Updated status for {len(updated)} animals"
    })

@app.route("/api/animals/ble-status", methods=["GET"])
def ble_status():
    """Get all animals with their last known Bluetooth status"""
    animals = Animal.query.all()
    return jsonify([{
        "id": a.id,
        "name": a.name,
        "device_id": a.device_id,
        "status": a.status,
        "last_seen": a.last_seen.isoformat() if a.last_seen else None,
        "battery_level": a.battery_level,
        "signal_strength": a.signal_strength
    } for a in animals])

# ============ BACKGROUND JOBS ============

def cleanup_old_alerts():
    """Background job to archive old read alerts (runs daily)"""
    try:
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        old_alerts = Alert.query.filter(
            Alert.is_read == True,
            Alert.created_at < cutoff_date
        ).all()
        
        for alert in old_alerts:
            db.session.delete(alert)
        
        db.session.commit()
        logger.info(f"Cleaned up {len(old_alerts)} old alerts")
    except Exception as e:
        logger.error(f"Error cleaning up alerts: {e}")

# Schedule the cleanup job to run daily at midnight
scheduler.add_job(
    func=cleanup_old_alerts,
    trigger="cron",
    hour=0,
    minute=0,
    id="cleanup_alerts"
)

def check_inactive_animals():
    """Background job to check for animals not seen in 24 hours"""
    try:
        from datetime import timedelta
        cutoff_time = datetime.utcnow() - timedelta(hours=24)
        inactive_animals = Animal.query.filter(
            Animal.last_seen < cutoff_time
        ).all()
        
        for animal in inactive_animals:
            # Create warning alert
            existing = Alert.query.filter(
                Alert.animal_id == animal.id,
                Alert.alert_type == "INACTIVE",
                Alert.created_at > cutoff_time
            ).first()
            
            if not existing and animal.status == "IN":
                alert = Alert(
                    animal_id=animal.id,
                    alert_type="INACTIVE",
                    message=f"WARNING: {animal.name} has not been seen in 24 hours!"
                )
                db.session.add(alert)
        
        if inactive_animals:
            db.session.commit()
            logger.warning(f"Found {len(inactive_animals)} inactive animals")
    except Exception as e:
        logger.error(f"Error checking inactive animals: {e}")

# Schedule inactive check every 6 hours
scheduler.add_job(
    func=check_inactive_animals,
    trigger="interval",
    hours=6,
    id="check_inactive"
)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

