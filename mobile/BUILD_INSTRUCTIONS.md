# EAS Build Setup - Complete Guide

## Files Created:
✅ eas.json - Build profiles configured
✅ app.json - Updated with Android config
✅ .env.example - Environment variables template
✅ .gitignore - Protect credentials

## STEP-BY-STEP COMMANDS:

### 1. Initialize EAS Project (ONE TIME ONLY)
```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
eas init
```
Select your account when prompted. This adds projectId to app.json.

### 2. Configure Google Maps API Key (REQUIRED)
Edit app.json and replace `GOOGLE_MAPS_API_KEY` with your actual key:
```json
"config": {
  "googleMaps": {
    "apiKey": "AIzaSy..."
  }
}
```

### 3. Build APK (Development/Testing)
```bash
eas build --profile preview --platform android
```
- Generates installable APK
- EAS handles signing automatically
- Download link provided after build

### 4. Build AAB (Google Play Store)
```bash
eas build --profile production --platform android
```
- Generates AAB for Play Store
- EAS handles signing automatically
- Download link provided after build

### 5. Submit to Play Store (Optional)
```bash
eas submit --platform android
```

## Build Profiles Explained:

**preview** → APK for direct installation
**production** → AAB for Play Store

## Credentials:
EAS automatically generates and manages:
- Android keystore
- Upload key
- Signing certificates

No manual keystore creation needed.

## Push Notifications:
Already configured in app.json with expo-notifications plugin.
Get push token in app:
```javascript
import * as Notifications from 'expo-notifications';
const token = await Notifications.getExpoPushTokenAsync();
```

## Google Maps:
Add API key to app.json before building.
Get key: https://console.cloud.google.com/apis/credentials

## Check Build Status:
```bash
eas build:list
```

## Download Build:
After build completes, download from provided URL or:
```bash
eas build:download --platform android
```

## Common Issues:

**"An unexpected error occurred"**
Run: `eas whoami` to verify login
Run: `eas init` if project not initialized

**Build fails**
Check: `eas build:list` for error details
Verify: app.json has valid package name

**Google Maps not working**
Ensure API key is added to app.json before building
Enable Maps SDK for Android in Google Cloud Console
