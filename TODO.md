# 🐄 Animal Tracker - Complete with Bluetooth Scanning

## ✅ Completed Features

### Original Features
- ✅ Live GPS Tracking on map
- ✅ Geofence alert system
- ✅ Instant alerts when animals exit
- ✅ Sound notifications
- ✅ Add/Register animals
- ✅ Test alerts simulation

### NEW - Bluetooth Proximity Detection
- ✅ **BluetoothScanner.jsx** - Scans for nearby BLE devices
- ✅ **Signal Strength (RSSI)** - Shows dBm with visual bars
- ✅ **Distance Estimation** - Approximate meters based on signal
- ✅ **IN/OUT Status** - Green = in range, Red = out of range
- ✅ **Auto-Scan Mode** - Continuously scans every 5 seconds
- ✅ **Demo Mode** - Simulates devices for testing
- ✅ **Backend Endpoints** - `/api/bluetooth/status` and `/api/animals/ble-status`
- ✅ **Dashboard Integration** - Scanner shown below the map

---

## How Bluetooth Detection Works

### With Your Phone:
```
1. Open app on your phone
2. Go to dashboard
3. Click "🔍 Scan for Animals" or enable "Auto-Scan"
4. Phone scans for nearby BLE devices (10-100m range)
5. Shows all detected animals with signal strength:

   ┌────────────────────────────────────────────┐
   │ 🟢 BLE-001 "Bessie"    📶 -45 dBm   IN    │
   │    Distance: ~5m   |   Last seen: 2s ago  │
   ├────────────────────────────────────────────┤
   │ 🔴 BLE-004 "Sarah"    ❌ Not Found  OUT   │
   │    Missing for 5 min  |  Alert triggered! │
   └────────────────────────────────────────────┘
```

### Data Flow:
```
Phone Bluetooth Scan → Detects BLE devices → Sends to Backend
                                                        │
                                                        ▼
                                    Backend Updates Animal Status
                                                        │
                                                        ▼
                                    Frontend shows IN/OUT on map
                                                        │
                                                        ▼
                                    Alert panel shows warnings
```

---

## Start the Project

```bash
# Terminal 1 - Backend
cd backend && python app.py
# Server: http://localhost:5000

# Terminal 2 - Frontend
cd frontend && npm run dev
# App: http://localhost:3001
```

---

## Login
- Email: `admin@farm.com`
- Password: `admin123`

---

## Test Bluetooth Scanner

1. Open http://localhost:3001
2. Scroll down to "🔵 Bluetooth Scanner"
3. Click "🎮 Demo Mode (Simulate Devices)" to test without real hardware
4. Or click "🔍 Scan for Animals" to scan real BLE devices
5. Enable "▶ Auto-Scan ON" for continuous scanning

---

## How to Use with Real Hardware

### On Your Phone (Mobile App):
1. Open the tracker app
2. Walk around with your phone
3. The app scans for BLE devices every few seconds
4. Animals in range → Green checkmark
5. Animals out of range → Red alert

### Backend Receives:
```bash
POST /api/bluetooth/status
{
  "device_ids": ["BLE-001", "BLE-002"],  // Found nearby
  "not_found_ids": ["BLE-004"]           // Not detected
}
```

### Result:
- BLE-001, BLE-002 → Status = "IN" (safe)
- BLE-004 → Status = "OUT" → Alert triggered!

---

## Files Modified/Created

| File | Action |
|------|--------|
| `frontend/src/components/BluetoothScanner.jsx` | Created |
| `frontend/src/components/Dashboard.jsx` | Modified (added scanner) |
| `frontend/src/services/api.js` | Modified (added bluetoothAPI) |
| `backend/app.py` | Modified (added bluetooth endpoints) |

---

## RSSI Signal Strength Guide

| Signal | dBm | Distance | Status |
|--------|-----|----------|--------|
| 🟢 Excellent | -50 to 0 | < 3m | Very Close |
| 🟢 Good | -50 to -70 | 3-10m | In Range |
| 🟡 Fair | -70 to -85 | 10-30m | Moderate |
| 🟠 Weak | -85 to -100 | 30-50m | Far |
| 🔴 No Signal | < -100 | > 50m | Out of Range |

