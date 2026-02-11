#!/bin/bash

echo "==================================="
echo "EAS Build Setup & Execution"
echo "==================================="

cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile

# Step 1: Check if EAS CLI is installed
echo ""
echo "Step 1: Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "Installing EAS CLI..."
    npm install -g eas-cli
else
    echo "✓ EAS CLI already installed"
fi

# Step 2: Check login status
echo ""
echo "Step 2: Checking Expo login..."
eas whoami || {
    echo "Please login to Expo:"
    eas login
}

# Step 3: Show project info
echo ""
echo "Step 3: Project Info"
eas project:info

# Step 4: Ask which build to create
echo ""
echo "==================================="
echo "Select build type:"
echo "1) Development APK (for testing with dev client)"
echo "2) Preview APK (production-like, direct install)"
echo "3) Production AAB (for Google Play Store)"
echo "==================================="
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Building Development APK..."
        eas build --platform android --profile development
        ;;
    2)
        echo "Building Preview APK..."
        eas build --platform android --profile preview
        ;;
    3)
        echo "Building Production AAB..."
        eas build --platform android --profile production
        ;;
    *)
        echo "Invalid choice. Run script again."
        exit 1
        ;;
esac

echo ""
echo "==================================="
echo "Build submitted! Check status at:"
echo "https://expo.dev/accounts/qoriyow1233/projects/animal-tracker-mobile/builds"
echo "==================================="
