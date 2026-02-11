# FINAL COMMANDS - BUILD ANDROID APK

## OPTION 1: Local Build (RECOMMENDED - No network issues)

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
./build-local.sh
```

This will:
1. Install Java if needed
2. Generate Android project
3. Build release APK
4. Show APK location

APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## OPTION 2: EAS Cloud Build (Requires internet)

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

---

## MANUAL STEPS (if script fails)

### 1. Install Java
```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### 2. Generate Android project
```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
npx expo prebuild --platform android --clean
```

### 3. Build APK
```bash
cd android
./gradlew assembleRelease
```

### 4. Find APK
```bash
ls -lh app/build/outputs/apk/release/app-release.apk
```

---

## INSTALL APK ON DEVICE

### Via USB:
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Via File Transfer:
1. Copy APK to phone
2. Open file on phone
3. Enable "Install from unknown sources"
4. Install

---

## BUILD AAB FOR PLAY STORE

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile/android
./gradlew bundleRelease
```

AAB location: `app/build/outputs/bundle/release/app-release.aab`

---

## ENVIRONMENT VARIABLES

Update in `.env` file:
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com
GOOGLE_MAPS_API_KEY=your_actual_key
```

---

## GOOGLE MAPS API KEY

1. Get key: https://console.cloud.google.com/apis/credentials
2. Enable "Maps SDK for Android"
3. Update `app.json` line 21
4. Rebuild app

---

## PUSH NOTIFICATIONS

Already configured with expo-notifications.
Will work automatically in production build.

---

## QUICK START

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
./build-local.sh
```

Done! APK ready to install.
