#!/bin/bash

# SAPO Emprego Autofill - Force Rebuild Script

echo "🔧 SAPO Emprego Autofill - Force Rebuild"
echo "=========================================="
echo ""

# Step 1: Quit Safari
echo "1️⃣  Quitting Safari..."
osascript -e 'quit app "Safari"' 2>/dev/null
sleep 2
echo "   ✅ Safari quit"
echo ""

# Step 2: Clean derived data (optional but recommended)
echo "2️⃣  Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SAPO_Emprego_Autofill-* 2>/dev/null
echo "   ✅ Derived data cleaned"
echo ""

# Step 3: Open Xcode project
echo "3️⃣  Opening Xcode project..."
PROJECT_PATH="SAPO Emprego Autofill/SAPO Emprego Autofill.xcodeproj"

if [ ! -d "$PROJECT_PATH" ]; then
    echo "   ❌ Error: Xcode project not found!"
    echo "   Make sure you're in the safari-sapo-autofill-extension directory"
    exit 1
fi

open "$PROJECT_PATH"
echo "   ✅ Xcode opened"
echo ""

# Step 4: Instructions for user
echo "📋 Next steps in Xcode:"
echo "   1. Press ⇧ + ⌘ + K (Shift + Command + K) to Clean Build Folder"
echo "   2. Wait for 'Clean Finished' message"
echo "   3. Press ⌘ + R (Command + R) to Build and Run"
echo "   4. Safari will launch automatically"
echo ""

echo "🧪 Testing steps:"
echo "   1. Go to any SAPO Emprego job page"
echo "   2. Press ⌘ + ⌥ + I to open Web Inspector"
echo "   3. Go to Console tab"
echo "   4. Look for: 'SAPO Autofill Extension loaded'"
echo "   5. Click anywhere on the page"
echo "   6. You should see: '🔵 RAW CLICK EVENT detected on: ...'"
echo ""

echo "📖 For detailed instructions, see: FORCE-REBUILD.md"
echo "📖 For testing guide, see: TEST-CLICKS.md"
echo ""

echo "✅ Ready! Now complete the steps in Xcode."

