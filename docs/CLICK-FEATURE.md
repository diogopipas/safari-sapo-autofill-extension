# Form Click Feature

## Overview

The extension now supports click-based interactions directly on the SAPO Emprego form page:

- **Single Click**: Automatically fills the form with your saved data
- **Double Click**: Opens the extension popup to edit your data

## How It Works

### Single Click Autofill

1. Click anywhere on the form (except buttons or links)
2. The extension will load your saved data from storage
3. If data exists, it automatically fills all form fields
4. If no data is saved, you'll see a notification to set up your data first

### Double Click to Edit

1. Double-click anywhere on the form (except buttons or links)
2. The extension attempts to open the popup window automatically
3. If the browser doesn't allow automatic popup opening, you'll see a notification
4. Edit your information in the popup and save

## Implementation Details

### Content Script (`content.js`)

- Attaches a click listener to the form element
- Uses a 300ms delay to distinguish between single and double clicks
- Single click: Loads data from `chrome.storage.local` or `browser.storage.local`
- Double click: Sends a message to the background script to open the popup

### Background Script (`background.js`)

- Listens for `openPopup` messages from the content script
- Attempts to open the popup using `browser.action.openPopup()` (Firefox) or `chrome.action.openPopup()` (Chrome)
- If the popup cannot be opened automatically (browser restrictions), shows a notification to the user

### Permissions

The extension now requires the `notifications` permission to show fallback notifications when the popup cannot be opened automatically.

## User Experience Flow

### First Time User

1. Double-click the form to open the popup
2. Enter your information and upload files
3. Click "Save Data"
4. Next time, single-click to autofill instantly

### Regular User

1. Single-click the form to autofill with saved data
2. Double-click if you need to update your information

## Browser Compatibility

- **Firefox**: Full support for automatic popup opening
- **Chrome/Edge**: May show notification instead of opening popup due to API restrictions
- **Safari**: May show notification instead of opening popup

## Notes

- Clicks on buttons, submit buttons, and links are ignored to avoid interfering with normal form interaction
- The click listener is attached to the entire form or document body if no form is found
- All data is stored locally in the browser using the Storage API

