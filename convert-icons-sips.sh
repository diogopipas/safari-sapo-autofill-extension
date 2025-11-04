#!/bin/bash

# Convert SVGs to PNGs using sips and copy to Xcode Assets
echo "Converting SVGs to PNGs using sips..."

ICONS_DIR="icons"
ASSETS_DIR="SAPO Emprego Autofill/Shared (App)/Assets.xcassets/AppIcon.appiconset"

# Clean up old PNGs first
rm -f "$ICONS_DIR"/*.png

# Convert all SVG files to PNG
for size in 16 32 64 128 256 512 1024; do
    echo "Converting icon-$size.svg..."
    sips -s format png "$ICONS_DIR/icon-$size.svg" --out "$ICONS_DIR/icon-$size.png" > /dev/null 2>&1
done

echo ""
echo "Copying icons to Xcode Assets..."

# Copy to Xcode Assets folder with correct naming
cp "$ICONS_DIR/icon-16.png" "$ASSETS_DIR/mac-icon-16@1x.png"
cp "$ICONS_DIR/icon-32.png" "$ASSETS_DIR/mac-icon-16@2x.png"
cp "$ICONS_DIR/icon-32.png" "$ASSETS_DIR/mac-icon-32@1x.png"
cp "$ICONS_DIR/icon-64.png" "$ASSETS_DIR/mac-icon-32@2x.png"
cp "$ICONS_DIR/icon-128.png" "$ASSETS_DIR/mac-icon-128@1x.png"
cp "$ICONS_DIR/icon-256.png" "$ASSETS_DIR/mac-icon-128@2x.png"
cp "$ICONS_DIR/icon-256.png" "$ASSETS_DIR/mac-icon-256@1x.png"
cp "$ICONS_DIR/icon-512.png" "$ASSETS_DIR/mac-icon-256@2x.png"
cp "$ICONS_DIR/icon-512.png" "$ASSETS_DIR/mac-icon-512@1x.png"
cp "$ICONS_DIR/icon-1024.png" "$ASSETS_DIR/mac-icon-512@2x.png"
cp "$ICONS_DIR/icon-1024.png" "$ASSETS_DIR/universal-icon-1024@1x.png"

echo "✓ All icons copied to Xcode Assets"
echo ""
echo "Done! Now:"
echo "1. Open your Xcode project"
echo "2. Clean Build Folder (Product > Clean Build Folder or Cmd+Shift+K)"
echo "3. Rebuild the app"
echo ""

