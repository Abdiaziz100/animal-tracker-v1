# EAS Build Guide - Complete Setup

## Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

## Step 2: Login to Expo
```bash
cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile
eas login
```

## Step 3: Check if project is linked
```bash
eas whoami
eas project:info
```

## Step 4: Create placeholder assets (if missing)
```bash
# Create assets directory if it doesn't exist
mkdir -p src/assets

# Create placeholder icon (1024x1024)
convert -size 1024x1024 xc:green -fill white -pointsize 200 -gravity center -annotate +0+0 "AT" src/assets/icon.png 2>/dev/null || echo "Install ImageMagick or create manually"

# Create placeholder splash (1284x2778)
convert -size 1284x2778 xc:white -fill green -pointsize 100 -gravity center -annotate +0+0 "Animal Tracker" src/assets/splash.png 2>/dev/null || echo "Install ImageMagick or create manually"

# Create adaptive icon (1024x1024)
cp src/assets/icon.png src/assets/adaptive-icon.png 2>/dev/null || echo "Create manually"

# Create notification icon (96x96, white on transparent)
convert -size 96x96 xc:none -fill white -draw "circle 48,48 48,10" src/assets/notification-icon.png 2>/dev/null || echo "Create manually"
```

## Step 5: Configure credentials
```bash
# Let EAS manage credentials automatically
eas credentials
```

## Step 6: Build APK (Development - for testing)
```bash
eas build --platform android --profile development
```

## Step 7: Build APK (Preview - production-like APK)
```bash
eas build --platform android --profile preview
```

## Step 8: Build AAB (Production - for Play Store)
```bash
eas build --platform android --profile production
```

## Environment Variables Needed

Create `.env` file with:
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Troubleshooting

### Error: "An unexpected error occurred"
Run with verbose logging:
```bash
eas build --platform android --profile preview --clear-cache
```

Check logs:
```bash
cat ~/.expo/eas-build-*.log
```

### Error: Missing assets
Manually create these files in `src/assets/`:
- icon.png (1024x1024)
- splash.png (1284x2778)
- adaptive-icon.png (1024x1024)
- notification-icon.png (96x96, white on transparent)

### Error: Project not configured
```bash
eas build:configure
```

### Error: Not logged in
```bash
eas logout
eas login
```

## Quick Build Commands

**For testing (APK):**
```bash
eas build -p android --profile preview
```

**For Play Store (AAB):**
```bash
eas build -p android --profile production
```

**Download build:**
After build completes, download from the URL provided or:
```bash
eas build:list
```
