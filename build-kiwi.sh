#!/usr/bin/env bash
#
# Build script for Kiwi Browser (Android) compatibility - uses Manifest V2
#

set -e

echo "Building Cookiedough Chrome Extension for Kiwi Browser (Manifest V2)..."

# Clean previous builds
rm -f ../cookiedough-kiwi.zip
rm -rf distro

# Build for Kiwi Browser (Manifest V2)
npm run build:v2

echo "Kiwi Browser build completed successfully!"
echo "Creating extension package..."

# Create zip package
cd distro
zip -r ../../cookiedough-kiwi.zip *

echo "Kiwi Browser extension package created: ../cookiedough-kiwi.zip"
echo ""
echo "To install in Kiwi Browser:"
echo "1. Copy cookiedough-kiwi.zip to your device"
echo "2. In Kiwi Browser, go to Settings > Extensions"
echo "3. Enable 'Developer mode'"
echo "4. Click 'Load unpacked' and extract the zip file"
echo "5. Or click 'Load from file' and select the zip file"