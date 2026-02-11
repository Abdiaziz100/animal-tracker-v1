# FASTEST WAY TO BUILD - USE EAS CLOUD

## Your network is slow for downloads. Use EAS cloud build instead.

## EXACT COMMANDS (5 minutes setup, 15 min build):

```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile

# 1. Install EAS CLI (one time)
npm install -g eas-cli

# 2. Login
eas login

# 3. Build APK (cloud builds it for you)
eas build --platform android --profile preview

# 4. Wait 15-20 minutes, download APK from URL provided
```

## THAT'S IT!

EAS servers will:
- Download all dependencies
- Build your APK
- Give you download link

No local Gradle, no Java issues, no network timeouts.

## After build completes:
1. Click the URL shown
2. Download APK
3. Install on Android device

## For Play Store AAB:
```bash
eas build --platform android --profile production
```

## All files are already configured:
✅ app.json
✅ eas.json  
✅ package.json

Just run the commands above.
