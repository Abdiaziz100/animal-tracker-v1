# Hardware Requirements for Animal Tracker System

## Current Status

⚠️ **Important:** The hardware for this project has **NOT been built yet**. The software is complete and ready, but the physical tracking devices need to be created/purchased.

---

## Hardware Needed Per Animal

### Option 1: DIY GPS Tracker (Recommended for Cost)

```
┌─────────────────────────────────────────┐
│           GPS TRACKER DEVICE            │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────┐   ┌─────────────┐     │
│  │   ESP32     │   │   GPS Module│     │
│  │  (MCU)      │   │  (Neo-6M)   │     │
│  │             │   │             │     │
│  │  WiFi + BLE │   │  Antenna    │     │
│  └─────────────┘   └─────────────┘     │
│         │                │              │
│  ┌─────────────┐   ┌─────────────┐     │
│  │  Battery    │   │  Solar      │     │
│  │  LiPo 3.7V  │   │  Panel      │     │
│  │  2000mAh    │   │  (optional) │     │
│  └─────────────┘   └─────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

**Components Needed:**

| Component | Model | Cost (Approx) | Purpose |
|-----------|-------|---------------|---------|
| Microcontroller | ESP32 | $5-8 | Main brain, WiFi, BLE |
| GPS Module | Neo-6M/Neo-7M | $5-10 | Get location |
| Battery | LiPo 2000mAh | $5-8 | Power |
| Solar Panel | 5V 1W | $3-5 | Recharge |
| Enclosure | Waterproof box | $2-5 | Protection |
| Antenna | GPS Antenna | $2-3 | Better signal |
| **Total** | | **$22-39** | Per device |

---

### Option 2: Commercial GPS Trackers

| Product | Cost | Features |
|---------|------|----------|
| TKSTAR TK905 | $25-35 | GPS, GSM, waterproof |
| GPS Smart Pet Tracker | $30-50 | Real-time tracking, app |
| Aorkuler Smart Tracker | $40-60 | No subscription |

---

## How the Hardware Works

### Data Flow from Device:

```
1. GPS Module gets coordinates
2. ESP32 reads: lat, lng, battery level
3. ESP32 connects to WiFi
4. ESP32 sends HTTP POST to backend:
   
   POST https://animal-tracker-v1.onrender.com/api/gps
   {
     "device_id": "BLE-COW-001",
     "lat": -1.2925,
     "lng": 36.8220,
     "battery": 85,
     "signal": -70
   }

5. Server responds with status
6. Deep sleep for 5 minutes
7. Repeat
```

### Code Example (Arduino/ESP32):

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>

// Your WiFi credentials
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "https://animal-tracker-v1.onrender.com/api/gps";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  // Initialize GPS
  // Initialize sensors
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String jsonData = "{\"device_id\":\"BLE-COW-001\",\"lat\":" + String(lat) + 
                      ",\"lng\":" + String(lng) + 
                      ",\"battery\":" + String(battery) + "}";
    
    int httpResponseCode = http.POST(jsonData);
    http.end();
  }
  
  // Sleep for 5 minutes
  ESP.deepSleep(5 * 60 * 1000000);
}
```

---

## Simplified Version: Bluetooth Only (No GPS)

If you don't need GPS tracking, you can use **Bluetooth beacons only**:

### What You Need:
1. **BLE Beacons** ($3-10 each)
   - iBeacon or Eddystone
   - Battery lasts 1-2 years
   
2. **Mobile App** (already built)
   - Farmer walks around farm with phone
   - App detects nearby beacons
   - Updates status automatically

### How It Works:
```
Farmer walks with phone
        │
        ▼
Mobile App scans for BLE devices
        │
        ├── Found "BLE-COW-001" → Status = IN
        ├── Found "BLE-COW-002" → Status = IN
        └── Not found "BLE-COW-003" → Status = OUT
                │
                ▼
        Send to server
```

**Pros:** Cheap, no internet needed for tracking
**Cons:** Only works when farmer is nearby, no real-time map

---

## Summary: What to Buy

| Scenario | Hardware Needed | Cost |
|----------|-----------------|------|
| **Full GPS Tracking** | ESP32 + GPS Module + Battery + Solar | $25-40/animal |
| **Bluetooth Only** | BLE Beacons | $5-10/animal |
| **Commercial** | Ready-made GPS tracker | $30-60/animal |

---

## Next Steps to Build Hardware

1. **Buy components** (ESP32, GPS module, battery)
2. **Write firmware** (Arduino code to send GPS data)
3. **Create enclosure** (3D print or waterproof box)
4. **Attach to animal** (collar or ear tag)
5. **Test** - Watch data appear on dashboard

---

*Hardware development guide for the Animal Tracker System*

