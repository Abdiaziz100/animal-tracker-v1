# FINAL BUILD INSTRUCTIONS

## Problem: EAS servers are down + Java not installed

## SOLUTION 1: Wait and use EAS (RECOMMENDED)
```bash
# Wait 30 minutes and retry
eas build --profile preview --platform android
```

## SOLUTION 2: Install Java and build locally
```bash
# Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk -y

# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Build APK
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile/android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

## SOLUTION 3: Use Android Studio
1. Open `/home/abdiaziz-mahat/animal_tracker_flutter/mobile/android` in Android Studio
2. Build → Generate Signed Bundle / APK
3. Select APK
4. Create new keystore or use existing
5. Build Release

## What's configured:
✅ eas.json - Build profiles
✅ app.json - Android config, permissions, Google Maps
✅ Native Android project generated in /android folder

## To build AAB for Play Store:
```bash
# With EAS (when servers are up)
eas build --profile production --platform android

# With Gradle (after installing Java)
cd android
./gradlew bundleRelease
# AAB at: android/app/build/outputs/bundle/release/app-release.aab
```

## Environment Variables:
Replace in app.json before building:
- GOOGLE_MAPS_API_KEY → Your actual Google Maps API key

## Push Notifications:
Already configured with expo-notifications plugin.
Will work automatically in production build.
