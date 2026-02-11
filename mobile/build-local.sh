#!/bin/bash

echo "=========================================="
echo "LOCAL ANDROID BUILD SCRIPT"
echo "=========================================="

cd /home/abdiaziz-mahat/animal_tracker_flutter/mobile

# Check Java
if ! command -v java &> /dev/null; then
    echo "Installing Java JDK 17..."
    sudo apt update
    sudo apt install -y openjdk-17-jdk
    export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
else
    echo "✓ Java already installed"
fi

# Set JAVA_HOME if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
    echo "Set JAVA_HOME=$JAVA_HOME"
fi

# Generate Android project
echo ""
echo "Generating Android native project..."
npx expo prebuild --platform android --clean

# Build APK
echo ""
echo "Building Release APK..."
cd android
chmod +x gradlew
./gradlew assembleRelease

# Check if build succeeded
if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
    echo ""
    echo "=========================================="
    echo "✓ BUILD SUCCESSFUL!"
    echo "=========================================="
    echo ""
    echo "APK Location:"
    echo "$(pwd)/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "File size:"
    ls -lh app/build/outputs/apk/release/app-release.apk | awk '{print $5}'
    echo ""
    echo "Install on device:"
    echo "adb install app/build/outputs/apk/release/app-release.apk"
    echo ""
else
    echo ""
    echo "=========================================="
    echo "✗ BUILD FAILED"
    echo "=========================================="
    echo "Check errors above"
fi
