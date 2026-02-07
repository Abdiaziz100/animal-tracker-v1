# 🐄 Animal Tracker - Bluetooth Scanning Feature

## Plan: Add Bluetooth Proximity Detection

### Information Gathered:
- Current app uses GPS coordinates for tracking
- User wants Bluetooth scanning to detect nearby animals
- BluetoothDevice.jsx already exists but only shows connection status
- Dashboard polls backend every 3 seconds for updates
- Animals are registered with device_id linked to ear tags

### Plan:

#### 1. Create New Component: `BluetoothScanner.jsx`
A dedicated component that:
- Scans for nearby BLE devices using Web Bluetooth API
- Shows list of found devices with signal strength (RSSI)
- Converts RSSI to distance approximation
- Matches found devices to registered animals
- Shows IN/OUT status based on proximity
- Auto-refreshes scanning every few seconds

#### 2. Update Dashboard.jsx
- Add BluetoothScanner component alongside the map
- Show combined view: GPS tracking + Bluetooth proximity
- Update animal status based on Bluetooth detection

#### 3. Add Backend Endpoint (Optional)
- `POST /api/bluetooth/status` - Update animal status from Bluetooth scan
- `GET /api/animals/ble-status` - Get animals with their BLE connection status

### Files to Create/Edit:
1. **Create**: `frontend/src/components/BluetoothScanner.jsx` - New scanner component
2. **Edit**: `frontend/src/components/Dashboard.jsx` - Add scanner to dashboard
3. **Edit**: `frontend/src/services/api.js` - Add Bluetooth API calls

### Feature Details:

#### Bluetooth Scanner Component:
```
┌─────────────────────────────────────────────────────────────────┐
│  🔵 Bluetooth Scanner                              [Scan] [Auto]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📡 Scanning for animals... (5 nearby)                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🟢 BLE-001 "Bessie"    📶 ████████░░░ (-45 dBm)  IN RANGE │  │
│  │                                                           │  │
│  │ Distance: ~5 meters  |  Last seen: 2s ago                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🟢 BLE-002 "Daisy"     📶 ██████░░░░░░ (-55 dBm)  IN RANGE │  │
│  │                                                           │  │
│  │ Distance: ~8 meters  |  Last seen: 3s ago                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🔴 BLE-004 "Sarah"     ❌ Not Found            OUT RANGE  │  │
│  │                                                           │  │
│  │ Status: NOT DETECTED for 2 minutes                       │  │
│  │ Last known: GPS (-1.293, 36.824)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  📊 Signal Legend: 🟢 Strong (> -60dBm)  🟡 Medium  🔴 Weak    │
└─────────────────────────────────────────────────────────────────┘
```

#### RSSI to Distance Conversion:
| RSSI | Approximate Distance | Status |
|------|---------------------|--------|
| > -50 dBm | < 3 meters | 🟢 Very Close |
| -50 to -70 dBm | 3-10 meters | 🟢 IN RANGE |
| -70 to -85 dBm | 10-30 meters | 🟡 Warning |
| -85 to -100 dBm | 30-50 meters | 🟠 Far |
| < -100 dBm / Not Found | > 50 meters | 🔴 OUT OF RANGE |

### Implementation Steps:
1. Create BluetoothScanner.jsx with Web Bluetooth API
2. Add device matching logic (compare scanned device_id with registered animals)
3. Show real-time signal strength with visual bars
4. Update status automatically when animals leave/return range
5. Add to Dashboard layout
6. Test with simulated BLE devices

### Follow-up Steps:
1. Run `npm run dev` to test the frontend
2. Start backend with `python app.py`
3. Open http://localhost:3001
4. Click "Scan Bluetooth" to detect nearby animals
5. Verify status changes when devices are in/out of range

