# Animal Tracker System - Project Overview

## Executive Summary

The **Animal Tracker System** is a complete IoT solution for real-time livestock monitoring and management. It enables farmers to track their animals' locations, monitor their status (inside/outside farm boundaries), and receive instant alerts when animals escape or require attention.

---

## Project Architecture

This project consists of **three main components**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANIMAL TRACKER SYSTEM                        │
├──────────────────┬──────────────────┬─────────────────────────┤
│   BACKEND        │    FRONTEND      │      MOBILE APP         │
│   (Python/Flask) │  (React + Vite)  │  (React Native/Expo)    │
├──────────────────┼──────────────────┼─────────────────────────┤
│ API Server       │ Web Dashboard    │ Field Tracking          │
│ Database         │ Map Visualization│ Bluetooth Scanner       │
│ Business Logic   │ Animal Management│ Alerts & Notifications  │
└────────┬─────────┴────────┬─────────┴────────────┬────────────┘
         │                  │                       │
         └──────────────────┴───────────────────────┘
                            │
                    (REST API)
                            │
         ┌──────────────────┴──────────────────┐
         │         HARDWARE DEVICES            │
         │  (BLE Tags / GPS Trackers)          │
         └─────────────────────────────────────┘
```

---

## Component Details

### 1. Backend (Python/Flask)

**Technology Stack:**
- Flask 3.0.0 - Web framework
- SQLAlchemy - Database ORM
- SQLite (development) / PostgreSQL (production)
- Gunicorn - Production server

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/login` | POST | User authentication |
| `/api/register` | POST | Create new user account |
| `/api/animals` | GET/POST | List/Create animals |
| `/api/animals/<id>` | GET/PUT/DELETE | Individual animal operations |
| `/api/gps` | POST | Receive GPS updates from hardware |
| `/api/bluetooth/status` | POST | Update status via Bluetooth |
| `/api/alerts` | GET | Fetch active alerts |
| `/api/geofence` | GET/POST | Configure farm boundaries |
| `/api/simulate/movement` | POST | Testing simulation |
| `/api/health` | GET | Server health check |

**Database Models:**
- **User** - Farm owner/manager accounts
- **Animal** - Livestock records (name, ear tag, device ID, location, status)
- **Geofence** - Farm boundary configuration
- **Alert** - System notifications (exit alerts, low battery)

**Hosting:** 
- Production: Railway (https://animal-tracker-v1.onrender.com)

---

### 2. Frontend Web Dashboard (React + Vite)

**Technology Stack:**
- React 18
- Vite - Build tool
- Tailwind CSS - Styling
- React Router - Navigation
- Axios - API client
- Leaflet - Map visualization

**Features:**
- **Dashboard** - Overview of all animals with status
- **Map View** - Interactive map showing animal locations
- **Animal Management** - Add, edit, delete animals
- **Alert Panel** - Real-time notifications
- **Geofence Editor** - Configure farm boundaries
- **History** - Track animal movements over time
- **Authentication** - Login/Register system

**Access:** Browser-based, responsive design

---

### 3. Mobile App (React Native + Expo)

**Technology Stack:**
- React Native (Expo)
- TypeScript
- React Navigation
- Bluetooth LE - Device scanning

**Features:**
- **Dashboard** - Quick overview
- **Animal List** - View all registered animals
- **Bluetooth Scanner** - Scan for nearby BLE devices
- **Alerts** - Push notifications for escape/battery
- **Authentication** - Login/Register

**Build Options:**
- Local development build
- EAS Build (Expo Application Services)
- APK generation for Android

---

## Key Features Explained

### 1. GPS Tracking
- Hardware devices send GPS coordinates to the API
- System calculates if animal is inside/outside geofence
- Real-time location updates on dashboard

### 2. Geofencing
- Define farm boundaries (center point + radius in km)
- Automatic status change: "IN" → "OUT" when animal exits
- Default: Nairobi, Kenya coordinates (-1.2921, 36.8219)

### 3. Bluetooth Proximity Detection
- Mobile app scans for BLE devices
- Detected devices marked as "IN"
- Missing devices marked as "OUT" (potential escape)
- Signal strength (RSSI) shows proximity

### 4. Alert System
- **Exit Alert** - Animal leaves farm boundary
- **Low Battery Alert** - Device battery < 20%
- **Bluetooth Alert** - Animal out of BLE range
- All alerts displayed in real-time

### 5. Hardware Integration
- Devices communicate via REST API
- Send: device_id, lat, lng, battery, signal
- Receive: confirmation + animal status

---

## Hardware Requirements (For Real-World Deployment)

### Animal Tracking Devices
```
┌────────────────────────────────────────┐
│         TRACKER DEVICE                 │
├────────────────────────────────────────┤
│  Components:                           │
│  - ESP32 Microcontroller               │
│  - GPS Module (Neo-6M/Neo-7M)          │
│  - BLE Module (built-in)               │
│  - Battery (LiPo 3.7V)                 │
│  - Solar Panel (optional)               │
│                                        │
│  Communication:                       │
│  - BLE: Proximity detection            │
│  - WiFi: Send GPS to backend           │
└────────────────────────────────────────┘
```

### Device Code Flow:
1. Initialize GPS and BLE
2. Read current location
3. Read battery level
4. POST to `/api/gps` endpoint
5. Receive status confirmation
6. Repeat on interval (e.g., every 5 minutes)

---

## Production Deployment Requirements

### For Real-World Use, You Need:

#### 1. Hardware (Per Animal)
- GPS tracker device ($15-30 per unit)
- BLE beacon/ADXL sensor
- Solar charging (recommended)

#### 2. Backend Infrastructure
- [x] Current: Free tier Railway (limited)
- Recommended: Railway Pro / Heroku / AWS
- Database: PostgreSQL (for production)

#### 3. Frontend Deployment
- [x] Current: Can be deployed to Vercel/Netlify
- Domain: Custom domain (optional)

#### 4. Mobile App Distribution
- Test: Direct APK installation
- Production: Google Play Store / Apple App Store

---

## Current System Status

| Component | Status | URL |
|-----------|--------|-----|
| Backend | ✅ Live | https://animal-tracker-v1.onrender.com |
| Frontend | ✅ Ready | Deploy to Vercel/Netlify |
| Mobile App | ⚠️ Dev | Build APK locally or EAS |

---

## Development Workflow

### Running Locally:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

**Mobile:**
```bash
cd mobile
npm install
npx expo start
# Runs in Expo Go app
```

---

## Cost Estimation (Production)

| Item | Monthly Cost (Est.) |
|------|---------------------|
| Backend (Railway Pro) | $20-50 |
| Database (PostgreSQL) | $5-20 |
| Frontend (Vercel Free) | $0 |
| Domain | $10-15/year |
| **Total** | **$25-85/month** |

---

## Next Steps for Production

1. **Hardware** - Build/procure GPS trackers
2. **Backend** - Upgrade to paid Railway plan
3. **Database** - Migrate to PostgreSQL
4. **Frontend** - Deploy to Vercel
5. **Mobile** - Build APK, submit to stores

---

## Contact & Support

For technical questions about the implementation, please refer to:
- Backend code: `/backend/app.py`
- Mobile services: `/mobile/src/services/`
- API documentation in code comments

---

*Document generated for business presentation purposes*
*Version: 1.0*

