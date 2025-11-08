# Popup Feature Update

## Summary

Added a popup interface for the Safari extension that appears when clicking the extension icon in Safari's toolbar. This allows users to fill forms directly from the popup without needing to pre-configure files.

## Changes Made

### New Files Created

1. **`popup.html`** - Popup interface HTML
   - Clean, modern form with all required fields
   - Name, email, phone inputs
   - File inputs for photo and CV
   - "Fill Form" and "Save Data" buttons
   - Status message area

2. **`popup.css`** - Popup styling
   - Compact 360px width design
   - Modern macOS-style UI
   - Properly sized logo (32px instead of 128px)
   - Smooth animations and transitions
   - Responsive design for different heights
   - Clean scrollbar styling

3. **`popup.js`** - Popup functionality
   - Form handling and validation
   - File to base64 conversion
   - Save/load data to browser storage
   - Message passing to content script
   - Status notifications

4. **`POPUP-GUIDE.md`** - Comprehensive documentation
   - How to use the popup
   - Two methods comparison (popup vs pre-configured)
   - Troubleshooting guide
   - Privacy and security information

5. **`CHANGELOG-POPUP.md`** - This file

### Modified Files

1. **`manifest.json`**
   - Added `"default_popup": "popup.html"` to action
   - Added `"storage"` permission for saving user data

2. **`content.js`**
   - Added message listener for popup communication
   - Created `performAutofillWithData()` function for popup data
   - Added `base64ToFileFromPopup()` helper function
   - Added `uploadFileFromData()` for popup file uploads

3. **`SAPO Emprego Autofill/Shared (App)/Resources/Style.css`**
   - Reduced logo size from 128px to 80px
   - Fixed scrolling issues
   - Improved spacing and layout
   - Added responsive breakpoints
   - Form now visible without scrolling

4. **`README.md`**
   - Added popup feature to features list
   - Updated usage section with popup method
   - Added popup files to project structure
   - Link to POPUP-GUIDE.md

## What Changed for Users

### Before
- Users had to pre-configure `userData.js` and `fileData.js`
- Had to run `node build-files.js` to generate file data
- Files had to be placed in the `assets/` folder
- Changes required regenerating files

### After
- Users can click the extension icon to open a popup
- Fill in information directly in the popup
- Select files on the fly
- Save data for future use (stored in browser)
- No need for pre-configuration (though still supported)

## Two Ways to Use

### Method 1: Popup (New, Easier)
1. Click extension icon
2. Fill form in popup
3. Click "Fill Form"
4. Done!

### Method 2: Pre-configured (Classic, Faster)
1. Set up `userData.js` and assets
2. Run `build-files.js`
3. Click extension icon
4. Auto-fills immediately

## Technical Details

### Storage
- Uses `browser.storage.local` API
- Saves form data (name, email, phone)
- Saves file data (photo, CV as base64)
- Data persists across sessions

### Communication
- Popup sends message to content script
- Message includes all form data and files
- Content script performs autofill with received data

### Compatibility
- Works with Safari 14+ (Manifest V3)
- Uses modern Web Extension APIs
- Gracefully handles both Chrome and Firefox APIs

## Benefits

1. **Easier Setup**: No need to configure files beforehand
2. **More Flexible**: Update information on the fly
3. **Better UX**: Visual interface instead of config files
4. **Privacy**: Data stored locally in browser
5. **Backwards Compatible**: Old method still works

## App Window Improvements

The macOS companion app window also received improvements:
- Logo properly sized (80px, down from 128px)
- Form visible without scrolling
- Better spacing and layout
- Responsive design for smaller windows

## Next Steps for User

1. **Rebuild in Xcode**:
   ```bash
   # Open Xcode project and rebuild (⌘R)
   ```

2. **Test the Popup**:
   - Navigate to a SAPO Emprego job page
   - Click the extension icon in Safari toolbar
   - Fill in the form in the popup
   - Click "Fill Form"

3. **Save Data** (optional):
   - Fill in the popup form
   - Click "Save Data"
   - Next time, data auto-loads

## Files to Add to Xcode Project

When rebuilding, make sure these files are copied to the extension:
- ✅ `popup.html`
- ✅ `popup.css`
- ✅ `popup.js`
- ✅ `manifest.json` (updated)
- ✅ `content.js` (updated)

The `xcrun safari-web-extension-converter` command should pick these up automatically.

## Troubleshooting

If the popup doesn't work:
1. Check that `manifest.json` has `"default_popup": "popup.html"`
2. Verify popup files exist in the extension directory
3. Rebuild in Xcode completely (clean build folder)
4. Check Safari's Console for errors
5. Ensure storage permission is granted

## Privacy & Security

- All data stays in the browser (local storage)
- No external API calls
- Files converted to base64 for storage
- Only runs on sapo.pt domains
- Can clear data via browser settings

---

**Date**: November 6, 2025
**Version**: 2.0 (Popup Release)

