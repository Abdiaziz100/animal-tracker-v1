# React Native Mobile App - TODO List

## Phase 1: Project Setup
- [x] Create package.json with dependencies
- [x] Create tsconfig.json
- [x] Create babel.config.js
- [x] Create app.json
- [x] Create metro.config.js (optional - Expo uses default)

## Phase 2: Configuration & Models
- [x] Create src/config/api.ts
- [x] Create src/models/user.ts
- [x] Create src/models/animal.ts
- [x] Create src/models/alert.ts

## Phase 3: Services
- [x] Create src/services/api.ts
- [x] Create src/services/bluetooth.ts
- [x] Create src/services/location.ts

## Phase 4: Context
- [x] Create src/context/AuthContext.tsx

## Phase 5: Navigation
- [x] Create src/navigation/AppNavigator.tsx

## Phase 6: Screens
- [x] Create src/screens/LoginScreen.tsx
- [x] Create src/screens/RegisterScreen.tsx
- [x] Create src/screens/DashboardScreen.tsx
- [x] Create src/screens/AnimalsScreen.tsx
- [x] Create src/screens/ScannerScreen.tsx
- [x] Create src/screens/AlertsScreen.tsx

## Phase 7: Components
- [x] Create src/components/AnimalCard.tsx
- [x] Create src/components/StatusBadge.tsx
- [x] Create src/components/BluetoothDeviceCard.tsx

## Phase 8: Entry Points
- [x] Create main.tsx
- [x] Create App.tsx

## Getting Started

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the Expo development server
npx expo start

# Or with custom port
npx expo start --port 8081
```

## API Configuration

The app connects to the Flask backend at:
- Development: `http://localhost:5000`
- Production: Update IP address for mobile device access

## Features Implemented

1. **Authentication**: Login/Register with JWT tokens
2. **Dashboard**: Overview of all animals with status
3. **Bluetooth Scanner**: BLE device detection for animal proximity
4. **GPS Tracking**: Location updates sent to backend
5. **Alerts**: Real-time notifications for geofence breaches
6. **Animals List**: View, add, and manage animals

## Running on Physical Device

For Android:
1. Enable Developer Options and USB Debugging on your phone
2. Connect via USB
3. Run `npx expo start`
4. Press 'a' to open on Android

For iOS:
1. Need Mac with Xcode for physical device testing
2. Or use Expo Go app with QR code scan

