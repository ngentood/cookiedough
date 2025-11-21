#!/usr/bin/env bash
#
# Production build script for Cookiedough Chrome Extension (Manifest V3)
#

set -e

echo "Building Cookiedough Chrome Extension for production (Manifest V3)..."

# Clean previous builds
rm -f ../cookiedough.zip
rm -rf distro

# Build for production (Manifest V3)
npm run build

echo "Production build completed successfully!"
echo "Creating extension package..."

# Create zip package
cd distro
zip -r ../../cookiedough.zip *

echo "Extension package created: ../cookiedough.zip"
echo ""
echo "For Kiwi Browser (Android) compatibility, use: ./build-kiwi.sh"