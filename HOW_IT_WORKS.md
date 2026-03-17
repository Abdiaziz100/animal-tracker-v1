# How the Animal Tracker System Works

## Quick Overview

This system tracks livestock using GPS and Bluetooth, sends alerts when animals leave the farm, and lets farmers monitor everything from a web dashboard or mobile app.

---

## Step-by-Step Workflow

### Scenario: A Farmer Named John Has 10 Cows

#### Step 1: Setup (One Time)
1. John registers an account on the web dashboard
2. John buys 10 GPS tracker devices (attached to cow collars)
3. John registers each cow in the system with:
   - Name: "Cow #1"
   - Ear Tag: "ET-001"
   - Device ID: "BLE-COW-001" (from the tracker)

#### Step 2: Tracking Devices Send Location
```
EVERY 5 MINUTES (example):
┌─────────────────┐      POST /api/gps      ┌──────────────┐
│  GPS Tracker    │ ──────────────────────► │   Backend    │
│  on Cow #1      │   {                      │   Server     │
│                 │     device_id,            │              │
│  Lat: -1.2925   │     lat: -1.2925,       │  1. Finds   │
│  Lng: 36.8220   │     lng: 36.8220,       │     the cow  │
│  Battery: 85%   │     battery: 85          │  2. Updates  │
│                 │   }                      │     location │
└─────────────────┘                          │  3. Checks   │
                                             │     geofence │
                                             └──────┬───────┘
                                                    │
                                             "IN" or "OUT"
```

#### Step 3: Geofence Check
The backend knows the farm boundaries:
- Farm Center: -1.2921, 36.8219 (Nairobi)
- Radius: 0.5 km

When Cow #1's location arrives:
```
Distance from farm center = 0.1 km (within 0.5 km)
Result: Status = "IN" ✓
```

If Cow #1 walks 1km away:
```
Distance from farm center = 1 km (OUTSIDE 0.5 km)
Result: Status = "OUT" → Create ALERT!
```

#### Step 4: John Gets Alerted
```
┌─────────────────────────────────────────┐
│  ALERT: Cow #1 has LEFT the farm!       │
│  Location: -1.2850, 36.8300             │
│  Time: 2:30 PM                          │
└─────────────────────────────────────────┘
```

John sees this on:
- Web Dashboard (red alert panel)
- Mobile App (push notification)

---

## Two Ways to Track Animals

### Method 1: GPS Tracking (Primary)
```
GPS Tracker → Sends coordinates → Backend → Dashboard shows on map
```
- Most accurate
- Works anywhere (requires cellular/WiFi)
- Best for large farms

### Method 2: Bluetooth Proximity (Secondary)
```
Mobile App scans for BLE devices nearby
         │
         ▼
   Found: BLE-COW-001 → Status = "IN"
   Not Found: BLE-COW-002 → Status = "OUT"
```
- Used when farmer walks around with phone
- No internet needed for scanning
- Limited range (~10-30 meters)

---

## Real-World Usage Example

### Morning: Farmer Checks Dashboard
```
┌──────────────────────────────────────┐
│  DASHBOARD                           │
│  ════════════                        │
│  Total Animals: 10                    │
│  Inside Farm: 9                      │
│  Outside: 1 ← ALERT!                 │
│                                      │
│  🐄 Cow #1 - OUT ⚠️                  │
│  🐄 Cow #2 - IN ✓                    │
│  🐄 Cow #3 - IN ✓                    │
│  ...                                  │
└──────────────────────────────────────┘
```

### Afternoon: Farmer Uses Mobile App
1. Opens "Scanner" screen
2. App scans for nearby BLE devices
3. Finds "BLE-COW-003" nearby → marks as IN
4. Doesn't find "BLE-COW-001" → marks as possibly OUT
5. Syncs with server

### Evening: GPS Update Arrives
```
Cow #1 (still outside):
- GPS reports lat/lng
- Backend calculates: still outside geofence
- Alert remains active
- Farmer gets directions to retrieve cow
```

---

## Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   HARDWARE  │     │   BACKEND   │     │  FRONTEND   │
│  (Trackers) │     │   (Server)  │     │  (Dashboard)│
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       │  1. GPS Data      │                    │
       ├───────────────────►│                    │
       │                    │  2. Process        │
       │                    │  - Save to DB      │
       │                    │  - Check geofence  │
       │                    │  - Create alert    │
       │                    │         │           │
       │                    │         ▼           │
       │                    │  3. Response        │
       │◄───────────────────┤                    │
       │                    │                    │
       │                    │  4. User sees       │
       │                    │     on dashboard    │
       │                    │◄───────────────────►│
       │                    │                    │
       └────────────────────┴────────────────────┘
              (REST API)
```

---

## Key Features in Action

| Feature | How It Works |
|---------|--------------|
| **GPS Tracking** | Device sends lat/lng every few minutes |
| **Geofencing** | Backend calculates distance from farm center |
| **Status IN/OUT** | Automatic based on geofence boundaries |
| **Exit Alerts** | Triggered when animal crosses boundary |
| **Low Battery Alert** | Triggered when battery < 20% |
| **Bluetooth Scan** | Mobile app detects nearby devices |
| **Map View** | Shows all animals on interactive map |

---

## Technical Details

### Backend API (Flask)
- Port 5000 (local) / Railway (production)
- SQLite database (dev) / PostgreSQL (prod)
- 10 API endpoints for all operations

### Frontend (React)
- Runs in browser
- Connects to backend API
- Real-time updates

### Mobile (React Native)
- iOS/Android app
- Bluetooth scanning
- Push notifications

---

## Summary

1. **Hardware** on animals sends GPS location to server
2. **Server** checks if location is inside farm boundaries
3. **Alerts** are created when animals leave
4. **Dashboard/App** shows locations and alerts in real-time
5. **Farmer** receives notifications and can locate animals

---

*Simple explanation for understanding the system flow*

