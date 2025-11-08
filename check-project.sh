#!/bin/bash

# Script to verify all extension resources are present
echo "🔍 Checking Safari Extension Resources..."
echo ""

# Required files
required_files=(
    "manifest.json"
    "background.js"
    "content.js"
    "userData.js"
    "fileData.js"
    "icons/icon-16.png"
    "icons/icon-32.png"
    "icons/icon-48.png"
    "icons/icon-64.png"
    "icons/icon-96.png"
    "icons/icon-128.png"
    "icons/icon-256.png"
    "icons/icon-512.png"
    "icons/icon-1024.png"
)

all_present=true

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING!"
        all_present=false
    fi
done

echo ""
if [ "$all_present" = true ]; then
    echo "✅ All extension resources are present!"
    echo ""
    echo "Next steps:"
    echo "1. Open SAPO Emprego Autofill.xcodeproj in Xcode"
    echo "2. Make sure all these files are added to the extension target"
    echo "3. Clean Build Folder (⌘⇧K)"
    echo "4. Build and Run (⌘R)"
    echo ""
    echo "If files are missing from Xcode, see FIX-SUMMARY.md for instructions."
else
    echo "❌ Some files are missing! Please check the errors above."
fi

