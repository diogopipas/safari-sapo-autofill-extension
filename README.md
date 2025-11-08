# Safari SAPO Emprego Autofill Extension

A Safari browser extension that automatically fills job application forms on SAPO Emprego with your pre-configured personal information, CV, and photo.

## Features

- 🎯 **Click-to-Fill**: Single-click form to autofill, double-click to edit data
- 🚀 **Instant Autofill**: Click once to instantly fill entire forms
- 📝 **Personal Info**: Automatically fills name, email, and phone number
- 📄 **CV Upload**: Uploads your CV (PDF) to the form
- 📷 **Photo Upload**: Uploads your profile photo (PNG) to the form
- ✅ **Terms Acceptance**: Automatically checks the terms and conditions checkbox
- 💾 **Data Storage**: All your info is securely stored in the browser
- 🎨 **Modern UI**: Beautiful, polished interface with custom file inputs

## Quick Start

### First Time Setup

**Before installation, configure your personal data:**

1. **Set up your information:**
   ```bash
   cp userData.example.js userData.js
   ```
   Edit `userData.js` with your name, email, and phone.

2. **Add your files:**
   - Add `assets/photo.png` (your photo)
   - Add `assets/CV.pdf` (your CV)

3. **Generate file data:**
   ```bash
   node build-files.js
   ```

See detailed setup instructions in [SETUP.md](SETUP.md)

### Installation

See detailed instructions in [INSTALLATION.md](INSTALLATION.md)

**Quick steps for Safari 14+ (macOS Big Sur and newer):**
1. Complete the setup above first!
2. Convert to Safari Web Extension: `xcrun safari-web-extension-converter .`
3. Open the generated Xcode project
4. Build and run in Xcode (⌘R)
5. Enable the extension in Safari Settings > Extensions

> **Note:** Safari 14+ requires Xcode. The old "Extension Builder" is no longer available.

### Usage

**🎯 Click-to-Fill Feature**

The fastest way to use the extension:

1. **Single-click** anywhere on the form → Automatically fills with your saved data
2. **Double-click** anywhere on the form → Opens popup to edit your information

See [CLICK-FEATURE.md](CLICK-FEATURE.md) for detailed documentation on this feature.

**📝 Edit & Save via Popup**

You can also click the extension icon to open the popup:
- Edit your information anytime (name, email, phone)
- Upload new photo or CV files
- Click "Save Data" to store changes for future use

See [USAGE.md](USAGE.md) for detailed usage guide.

## Project Structure

```
safari-sapo-autofill-extension/
├── manifest.json             # Extension configuration
├── background.js             # Background service worker
├── content.js               # Content script for form filling
├── popup.html               # NEW: Popup interface HTML
├── popup.css                # NEW: Popup styles
├── popup.js                 # NEW: Popup logic
├── userData.js              # Your personal info (NOT in git)
├── userData.example.js      # Template for personal info
├── fileData.js              # Base64-encoded files (NOT in git, generated)
├── fileData.example.js      # Template for file data
├── build-files.js           # Script to generate fileData.js
├── .gitignore               # Excludes personal data from git
├── assets/                  # Your personal files (NOT in git)
│   ├── photo.png           # Your photo
│   └── CV.pdf              # Your CV
├── icons/                   # Extension icons
├── SETUP.md                 # Personal data setup guide
├── INSTALLATION.md          # Extension installation guide
├── POPUP-GUIDE.md           # NEW: Popup usage guide
├── CLICK-FEATURE.md         # NEW: Click-to-fill feature guide
└── README.md                # This file
```

### Files Excluded from Git (Private)

These files contain your personal data and are **NOT** committed to GitHub:
- `userData.js` - Your name, email, phone
- `fileData.js` - Your files as base64
- `assets/photo.png` - Your photo
- `assets/CV.pdf` - Your CV

## How It Works

1. **Data Storage**: Your CV and photo are converted to base64 and embedded in the extension
2. **Form Detection**: The extension detects SAPO Emprego forms by looking for specific field patterns
3. **Field Filling**: Text fields are filled with your pre-configured information
4. **File Upload**: Base64 data is converted back to File objects and uploaded to file inputs
5. **Submission**: The terms checkbox is checked and the submit button is clicked

## Customization

### Change Personal Information

Edit `userData.js` (not `content.js`):

```javascript
const FORM_DATA = {
  name: 'Your Name',
  email: 'your.email@example.com',
  phone: 'your-phone'
};
```

Then reload the extension in Safari.

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
- ✅ **Safe to share on GitHub** - Personal data excluded via `.gitignore`
- ✅ Your private files (`userData.js`, `fileData.js`, `assets/*`) are NOT committed
- ✅ Other users can clone and add their own information

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

## Committing to GitHub

Your personal data is protected via `.gitignore`. Safe to commit:

```bash
# Verify protected files are ignored
git status --ignored | grep -E "(userData|fileData|assets)"

# Add and commit changes
git add .
git commit -m "Your commit message"
git push origin main
```

Your personal files (`userData.js`, `fileData.js`, `assets/`) will NOT be pushed to GitHub! 🔒

## Contributing

Feel free to fork this repository and customize it for your needs. The personal data setup ensures your information stays private while you can still share the code.

## License

This is a personal automation tool. Feel free to use and modify for your own purposes.

## Credits

Created for automating SAPO Emprego job applications.