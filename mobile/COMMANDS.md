# FINAL BUILD COMMANDS - COPY & PASTE READY

## Navigate to mobile directory
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile

## 1. Install EAS CLI (one-time)
npm install -g eas-cli

## 2. Login to Expo (one-time)
eas login

## 3. Verify login
eas whoami

## 4. Build APK for direct installation (RECOMMENDED FOR TESTING)
eas build --platform android --profile preview

## 5. Build AAB for Google Play Store
eas build --platform android --profile production

## 6. Check build status
eas build:list

## OR use the automated script:
./build-eas.sh

---

## ENVIRONMENT VARIABLES

Before building, update these in eas.json or set as secrets:

### For Preview/Production builds:
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-backend-url.com" --type string

eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "your_google_maps_api_key" --type string

### Or edit eas.json directly (already configured)

---

## GOOGLE MAPS API KEY

1. Go to: https://console.cloud.google.com/
2. Create project or select existing
3. Enable "Maps SDK for Android"
4. Create API Key (restrict to Android apps)
5. Add SHA-1 fingerprint (EAS will generate this)
6. Replace "GOOGLE_MAPS_API_KEY" in app.json

To get SHA-1 from EAS:
eas credentials

---

## PUSH NOTIFICATIONS

Already configured with expo-notifications plugin.

To test:
1. Build app with preview or production profile
2. Install on device
3. Get push token from app
4. Send test notification via Expo Push API

---

## TROUBLESHOOTING

### Error: "An unexpected error occurred"
eas build --platform android --profile preview --clear-cache

### Error: "Project not configured"
eas build:configure

### Error: "Invalid credentials"
eas credentials
# Select "Set up new credentials"

### View detailed logs
eas build:list
# Click on build URL to see logs

### Clear cache and retry
eas build --platform android --profile preview --clear-cache --no-wait

---

## BUILD PROFILES EXPLAINED

**development**: 
- Creates APK with dev client
- For development/debugging
- Larger file size

**preview**: 
- Creates APK (production-like)
- For testing before Play Store
- Can install directly on devices
- RECOMMENDED FOR INITIAL TESTING

**production**: 
- Creates AAB (Android App Bundle)
- For Google Play Store submission
- Smaller download size
- Optimized for distribution

---

## AFTER BUILD COMPLETES

1. Download APK/AAB from build URL
2. For APK: Transfer to Android device and install
3. For AAB: Upload to Google Play Console

### Install APK on device:
adb install path/to/your-app.apk

### Or transfer via USB and install manually

---

## GOOGLE PLAY STORE SUBMISSION

1. Build AAB: `eas build -p android --profile production`
2. Download AAB file
3. Go to: https://play.google.com/console
4. Create app or select existing
5. Upload AAB to Internal Testing track
6. Fill required store listing info
7. Submit for review

---

## QUICK START (COPY THIS)

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Wait for build to complete (~10-20 minutes)
Download APK from provided URL
Install on Android device
