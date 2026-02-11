# EXACT COMMANDS TO BUILD YOUR APP

## THE ERROR YOU'RE SEEING

"An unexpected error occurred" = Network issue connecting to Expo API servers

## SOLUTION: Run these commands in order

### 1. Navigate to project
```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
```

### 2. Check internet connection
```bash
ping -c 3 api.expo.dev
```

### 3. Login to Expo (if not already)
```bash
eas login
```

### 4. Verify you're logged in
```bash
eas whoami
```

### 5. Build APK (try this first)
```bash
eas build --platform android --profile preview --non-interactive
```

If you get network errors, try:

### 6. Alternative: Build with local credentials
```bash
eas build --platform android --profile preview --local
```

### 7. If still failing, check logs
```bash
cat ~/.expo/eas-build-*.log | tail -50
```

---

## IF NETWORK ISSUES PERSIST

### Option A: Use VPN or different network
The error suggests connectivity issues with api.expo.dev

### Option B: Build locally (without EAS cloud)
```bash
# Install dependencies
npm install

# Generate native Android project
npx expo prebuild --platform android

# Build locally
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

---

## WORKING CONFIGURATION FILES

All files are already configured:
- ✅ app.json (package: com.farm.animaltracker)
- ✅ eas.json (preview = APK, production = AAB)
- ✅ .env (environment variables)

---

## FINAL WORKING COMMANDS

### For APK (direct install):
```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
eas build -p android --profile preview
```

### For AAB (Play Store):
```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
eas build -p android --profile production
```

### Check build status:
```bash
eas build:list
```

---

## ENVIRONMENT VARIABLES

Update these in your code or set as EAS secrets:

```bash
# API URL
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value "https://your-backend.com" --type string

# Google Maps Key
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value "your_key_here" --type string
```

Or hardcode in app.json (line 21):
```json
"apiKey": "YOUR_ACTUAL_GOOGLE_MAPS_KEY"
```

---

## PUSH NOTIFICATIONS SETUP

Already configured! Just need to:

1. Build app
2. Install on device
3. App will request notification permission
4. Get push token from device
5. Send notifications via Expo Push API

---

## GOOGLE MAPS SETUP

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create API Key
3. Enable "Maps SDK for Android"
4. Restrict key to Android apps
5. Add package name: `com.farm.animaltracker`
6. Get SHA-1 fingerprint:
   ```bash
   eas credentials
   ```
7. Add SHA-1 to Google Console
8. Update app.json line 21 with your key

---

## WHAT EACH BUILD PROFILE DOES

**preview**: 
- Creates APK file
- Can install directly on any Android device
- No Play Store needed
- Best for testing

**production**: 
- Creates AAB file
- For Google Play Store only
- Smaller file size
- Optimized delivery

---

## AFTER BUILD COMPLETES

1. EAS will show a URL
2. Download APK/AAB from that URL
3. For APK: Install directly on device
4. For AAB: Upload to Play Store Console

---

## INSTALL APK ON DEVICE

### Method 1: USB
```bash
adb install path/to/app.apk
```

### Method 2: Direct download
1. Open URL on Android device
2. Download APK
3. Enable "Install from unknown sources"
4. Tap APK to install

---

## IF YOU STILL GET ERRORS

Run with verbose logging:
```bash
EAS_DEBUG=1 eas build --platform android --profile preview
```

Check specific error in logs:
```bash
ls -lt ~/.expo/*.log | head -1 | awk '{print $NF}' | xargs cat
```

---

## QUICK START (COPY THIS BLOCK)

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
npm install -g eas-cli
eas login
eas whoami
eas build --platform android --profile preview
```

Wait 10-20 minutes for build to complete.
Download APK from provided URL.
Install on Android device.

DONE! 🎉
