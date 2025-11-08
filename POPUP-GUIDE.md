# Extension Popup Guide

## What's New: Popup Interface

The extension now includes a popup that appears when you click the extension icon in Safari's toolbar. This allows you to fill forms directly from the popup without needing to pre-configure files.

## Two Ways to Use the Extension

### Method 1: Using the Popup (New!)

1. Navigate to a SAPO Emprego job application page
2. Click the **SAPO Emprego Autofill** icon in Safari's toolbar
3. A popup will appear with a form
4. Fill in your information:
   - Full Name
   - Email
   - Phone Number
   - Photo (select from your computer)
   - CV/Resume PDF (select from your computer)
5. Click **Fill Form** to automatically fill the page

**Benefits:**
- No need to pre-configure files
- Easy to update information on the fly
- Can save data for future use
- Works immediately after installation

### Method 2: Using Pre-configured Files (Classic)

1. Configure your data files:
   - Copy `userData.example.js` to `userData.js` and add your info
   - Add `photo.png` and `CV.pdf` to the `assets/` folder
   - Run `node build-files.js` to generate `fileData.js`
2. Navigate to a SAPO Emprego job application page
3. Click the extension icon (will auto-fill using your configured data)

**Benefits:**
- Faster (no need to select files each time)
- Files are pre-loaded
- Good for repeated use

## Popup Features

### Fill Form Button
- Immediately fills the current page with your data
- Uploads selected files
- Checks terms and conditions
- Submits the form automatically

### Save Data Button
- Saves your text information (name, email, phone) to browser storage
- Saves selected files for future use
- Data persists between popup sessions
- Note: Files are saved as base64 in browser storage

### Load Saved Data
- Automatically loads previously saved data when popup opens
- Restores your name, email, and phone
- Shows filenames if files were previously saved

## Storage

The popup uses browser's local storage to save your data:
- **FormData**: Name, email, phone (small, text-only)
- **FileData**: Photo and CV encoded as base64 (larger)
- **Security**: Data stays in your browser, never sent to external servers
- **Privacy**: Only accessible by this extension

## Tips

1. **First Time Setup**: Enter your information once and click "Save Data"
2. **Quick Fill**: Next time, just click "Fill Form" (data auto-loads)
3. **Update Files**: Select new files anytime and they'll override saved ones
4. **Verify Form**: Always check the filled form before final submission
5. **Clear Data**: Use browser settings to clear extension storage if needed

## Troubleshooting

### Popup doesn't open
- Make sure the extension is enabled in Safari Settings → Extensions
- Try refreshing Safari or restarting it
- Check Console for errors (Develop → Show Web Inspector)

### Data not saving
- Check browser console for errors
- Ensure storage permission is granted
- Try clearing browser cache and re-saving

### Files not uploading
- Ensure files are in correct format (PNG/JPG for photo, PDF for CV)
- Check file size (very large files may fail)
- Some websites block programmatic uploads

### Form not filling
- Make sure you're on a SAPO Emprego application page
- Check that all fields are filled in the popup
- Some forms may have different field names (check console logs)

## Browser Compatibility

The popup works with:
- ✅ Safari 14+ (macOS Big Sur and newer)
- ✅ Chrome (for testing with web-ext)
- ✅ Firefox (for testing with web-ext)

## Privacy & Security

- 🔒 All data stored locally in your browser
- 🔒 No external API calls or tracking
- 🔒 Files converted to base64 for storage
- 🔒 Extension only runs on sapo.pt domains
- 🔒 You can inspect all code (it's open source!)

## Development

To modify the popup:
- **HTML**: Edit `popup.html`
- **CSS**: Edit `popup.css`
- **JavaScript**: Edit `popup.js`
- **Manifest**: `manifest.json` (popup is registered under `action.default_popup`)

After changes:
1. Save files
2. Rebuild in Xcode (⌘R)
3. Reload extension in Safari
4. Test on a job application page

