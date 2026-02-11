#!/bin/bash

# EAS Build Setup Script for Animal Tracker

echo "=== EAS Build Setup ==="

# Step 1: Initialize EAS (run this manually if needed)
echo "Step 1: Initialize EAS project"
echo "Run: eas init"
echo ""

# Step 2: Configure build
echo "Step 2: Build configuration already created in eas.json"
echo ""

# Step 3: Build APK for development/testing
echo "Step 3: Build APK (development)"
echo "Run: eas build --profile preview --platform android"
echo ""

# Step 4: Build AAB for production
echo "Step 4: Build AAB (production)"
echo "Run: eas build --profile production --platform android"
echo ""

echo "=== Setup Complete ==="
