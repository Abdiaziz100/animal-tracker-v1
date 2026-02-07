from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import math
import os

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy BEFORE using it
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
    device_id = db.Column(db.String(100), unique=True, nullable=False)
    ear_tag = db.Column(db.String(50), unique=True)
    species = db.Column(db.String(50))
    lat = db.Column(db.Float, default=0)
    lng = db.Column(db.Float, default=0)
    status = db.Column(db.String(10), default="IN")
    battery_level = db.Column(db.Float, default=100)
    signal_strength = db.Column(db.Float, default=100)
    last_seen = db.Column(db.DateTime)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Geofence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    center_lat = db.Column(db.Float, default=-1.2921)
    center_lng = db.Column(db.Float, default=36.8219)
    radius_km = db.Column(db.Float, default=0.5)

class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey('animal.id'))
    alert_type = db.Column(db.String(20))
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
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
def login():
    data = request.json or {}
    user = User.query.filter_by(email=data.get("email", "")).first()
    
    if user and user.password == data.get("password", ""):
        return jsonify({
            "success": True,
            "user": {"id": user.id, "email": user.email, "name": user.name}
        })
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json or {}
    
    if User.query.filter_by(email=data.get("email", "")).first():
        return jsonify({"success": False, "message": "Email already exists"}), 400
    
    user = User(
        email=data.get("email", ""),
        password=data.get("password", ""),
        name=data.get("name", "")
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"success": True, "user": {"id": user.id, "email": user.email, "name": user.name}})

# ============ ANIMAL ROUTES ============

@app.route("/api/animals", methods=["GET", "POST"])
def animals():
    if request.method == "POST":
        data = request.json or {}
        
        # Check if device_id already registered
        if Animal.query.filter_by(device_id=data.get("device_id", "")).first():
            return jsonify({"success": False, "message": "Device ID already registered"}), 400
        
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
    
    # GET request - return all animals
    animals_list = Animal.query.all()
    return jsonify([{
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
    } for a in animals_list])

@app.route("/api/animals/<int:id>", methods=["GET", "PUT", "DELETE"])
def animal_detail(id):
    animal = Animal.query.get_or_404(id)
    
    if request.method == "GET":
        return jsonify({
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
        })
    
    if request.method == "PUT":
        data = request.json or {}
        animal.name = data.get("name", animal.name)
        animal.ear_tag = data.get("ear_tag", animal.ear_tag)
        animal.species = data.get("species", animal.species)
        db.session.commit()
        return jsonify({"success": True})
    
    if request.method == "DELETE":
        db.session.delete(animal)
        db.session.commit()
        return jsonify({"success": True})

# ============ GPS / TRACKING ROUTES ============

@app.route("/api/gps", methods=["POST"])
def gps_update():
    data = request.json or {}
    device_id = data.get("device_id")
    
    if not device_id:
        return jsonify({"success": False, "message": "Device ID required"}), 400
    
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
        alert = Alert(
            animal_id=animal.id,
            alert_type="EXIT",
            message=f"ALERT: {animal.name} has LEFT the farm boundary!"
        )
        db.session.add(alert)
    
    if data.get("battery", 100) < 20:
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
    alerts = Alert.query.filter_by(is_read=False).order_by(Alert.created_at.desc()).all()
    return jsonify([{
        "id": a.id,
        "animal_id": a.animal_id,
        "animal_name": a.animal.name if a.animal else "Unknown",
        "alert_type": a.alert_type,
        "message": a.message,
        "created_at": a.created_at.isoformat()
    } for a in alerts])

@app.route("/api/alerts/<int:id>/read", methods=["POST"])
def mark_alert_read(id):
    alert = Alert.query.get_or_404(id)
    alert.is_read = True
    db.session.commit()
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

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "timestamp": datetime.utcnow().isoformat()})

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

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

