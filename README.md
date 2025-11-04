# Safari SAPO Emprego Autofill Extension

A Safari browser extension that automatically fills job application forms on SAPO Emprego with your pre-configured personal information, CV, and photo.

## Features

- 🚀 **One-Click Autofill**: Click the toolbar button to instantly fill the entire form
- 📝 **Personal Info**: Automatically fills name, email, and phone number
- 📄 **CV Upload**: Uploads your CV (PDF) to the form
- 📷 **Photo Upload**: Uploads your profile photo (PNG) to the form
- ✅ **Terms Acceptance**: Automatically checks the terms and conditions checkbox
- 📤 **Auto-Submit**: Optionally submits the form after filling (with confirmation)

## Quick Start

### Installation

See detailed instructions in [INSTALLATION.md](INSTALLATION.md) or [QUICK-START.md](QUICK-START.md)

**Quick steps for Safari 14+ (macOS Big Sur and newer):**
1. Convert to Safari Web Extension: `xcrun safari-web-extension-converter .`
2. Open the generated Xcode project
3. Build and run in Xcode (⌘R)
4. Enable the extension in Safari Settings > Extensions

> **Note:** Safari 14+ requires Xcode. The old "Extension Builder" is no longer available.

### Usage

1. Go to any SAPO Emprego job application page
2. Click the **SAPO Emprego Autofill** button in the toolbar
3. Watch as your form gets filled automatically!
4. Verify the information and submit

## Project Structure

```
safari-sapo-autofill-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for form filling
├── fileData.js           # Base64-encoded CV and photo (generated)
├── build-files.js        # Script to generate fileData.js
├── generate-icons.js     # Script to generate extension icons
├── assets/               # Your personal files
│   ├── photo.png        # Your photo
│   └── CV.pdf           # Your CV
├── icons/                # Extension icons
│   ├── icon-48.png
│   ├── icon-96.png
│   └── icon-128.png
├── README.md             # This file
└── INSTALLATION.md       # Detailed installation guide
```

## How It Works

1. **Data Storage**: Your CV and photo are converted to base64 and embedded in the extension
2. **Form Detection**: The extension detects SAPO Emprego forms by looking for specific field patterns
3. **Field Filling**: Text fields are filled with your pre-configured information
4. **File Upload**: Base64 data is converted back to File objects and uploaded to file inputs
5. **Submission**: The terms checkbox is checked and the submit button is clicked

## Customization

### Change Personal Information

Edit the `FORM_DATA` object in `content.js`:

```javascript
const FORM_DATA = {
  name: 'Your Name',
  email: 'your.email@example.com',
  phone: 'your-phone'
};
```

### Update Files

1. Replace files in `assets/` folder
2. Run: `node build-files.js`
3. Reload extension in Safari

## Technical Details

- **Manifest Version**: 3 (latest Safari Web Extension standard)
- **Permissions**: Only works on `*.sapo.pt` domains
- **File Size**: CV and photo are embedded as base64 (no external file access needed)
- **Privacy**: All data stays local, no external servers involved

## Browser Compatibility

- ✅ Safari 14+ (macOS Big Sur or later)
- ✅ Safari 15+ (iOS 15+ for mobile, though extension needs conversion)

## Security & Privacy

- 🔒 Your personal data never leaves your computer
- 🔒 No external API calls or tracking
- 🔒 Only activates on SAPO Emprego domains
- ⚠️ Keep the extension folder private (contains your personal info)

## Troubleshooting

### Extension not showing up?
- Check Safari > Settings > Extensions
- Make sure "Show features for web developers" is enabled
- Try restarting Safari

### Form not filling?
- Open Web Inspector Console (Develop > Show Web Inspector)
- Look for ✓ and ✗ marks indicating what worked
- Check if field names match (SAPO may update their form structure)

### File uploads failing?
- Some forms have strict security that blocks programmatic uploads
- Check console for specific error messages
- May require manual file selection on some forms

For more help, see [INSTALLATION.md](INSTALLATION.md)

## Development

### Building the Extension

```bash
# Generate fileData.js from assets
node build-files.js

# Generate icons
node generate-icons.js

# Convert to Safari Web Extension
xcrun safari-web-extension-converter .
```

### Testing

1. Convert extension using `xcrun safari-web-extension-converter .`
2. Open the generated Xcode project
3. Build and run (⌘R)
4. Navigate to a SAPO Emprego job listing
5. Test the autofill button
6. Check Safari's Web Inspector console for debug output

## License

Personal use only. This extension contains your personal information.

## Credits

Created for automating SAPO Emprego job applications.