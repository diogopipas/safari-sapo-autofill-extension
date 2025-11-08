# Project Structure

This document explains the organization of the Safari SAPO Emprego Autofill Extension project.

## Directory Layout

```
safari-sapo-autofill-extension/
├── Extension Source Files (Root)
│   ├── manifest.json          # Extension configuration
│   ├── background.js          # Background service worker
│   ├── content.js            # Content script (main form filling logic)
│   ├── popup.html            # Extension popup interface
│   ├── popup.css             # Popup styling
│   ├── popup.js              # Popup logic and UI interactions
│   ├── userData.js           # Personal info (gitignored)
│   ├── userData.example.js   # Template for userData.js
│   ├── fileData.js           # Base64-encoded files (gitignored, generated)
│   └── fileData.example.js   # Template for fileData.js
│
├── assets/                    # Personal files (gitignored)
│   ├── photo.png             # Your profile photo
│   ├── CV.pdf                # Your CV/resume
│   └── README.md             # Instructions for assets
│
├── icons/                     # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-64.png
│   ├── icon-96.png
│   ├── icon-128.png
│   ├── icon-256.png
│   ├── icon-512.png
│   ├── icon-1024.png
│   └── *.svg                 # SVG source files
│
├── scripts/                   # Build and utility scripts
│   ├── build-files.js        # Converts assets to base64 fileData.js
│   ├── sync-to-xcode.js      # Syncs files to Xcode project
│   ├── generate-icons.js     # Generates icon files from SVG
│   ├── convert-icons-sips.sh # macOS icon conversion script
│   └── rebuild.sh            # Force rebuild helper
│
├── docs/                      # Documentation
│   ├── SETUP.md              # Initial setup guide
│   ├── INSTALLATION.md       # Installation instructions
│   ├── USAGE.md              # How to use the extension
│   ├── POPUP-GUIDE.md        # Popup interface guide
│   ├── CLICK-FEATURE.md      # Click-to-fill documentation
│   ├── PROJECT-STRUCTURE.md  # This file
│   └── ...                   # Additional documentation
│
├── SAPO Emprego Autofill/    # Xcode project (Safari wrapper)
│   ├── iOS (App)/            # iOS app wrapper
│   ├── iOS (Extension)/      # iOS extension settings
│   ├── macOS (App)/          # macOS app wrapper
│   ├── macOS (Extension)/    # macOS extension settings
│   ├── Shared (App)/         # Shared app resources
│   ├── Shared (Extension)/   # Shared extension resources
│   │   └── Resources/        # Extension files (synced from root)
│   │       ├── manifest.json
│   │       ├── background.js
│   │       ├── content.js
│   │       ├── popup.*
│   │       ├── icons/
│   │       ├── userData.js
│   │       └── fileData.js
│   └── *.xcodeproj/          # Xcode project configuration
│
├── .gitignore                # Git ignore rules (protects personal data)
├── package.json              # NPM scripts and metadata
└── README.md                 # Main project documentation
```

## File Organization Principles

### 1. Extension Source at Root
The main extension files (`manifest.json`, `*.js`, `*.html`, `*.css`) are kept at the root level because:
- Safari Web Extension converter expects this structure
- Makes development and testing easier
- Standard pattern for browser extensions

### 2. Separation of Concerns

- **`assets/`** - Contains your personal files (photo, CV)
- **`icons/`** - All extension icons in various sizes
- **`scripts/`** - Build, sync, and utility scripts
- **`docs/`** - All documentation files
- **`SAPO Emprego Autofill/`** - Xcode project wrapper

### 3. Configuration Files

Configuration and data files:
- `userData.js` - Your personal information (name, email, phone)
- `fileData.js` - Base64-encoded files (generated, not edited manually)
- Both are **gitignored** to protect your personal data

### 4. Xcode Project Synchronization

The Xcode project contains a copy of extension files in:
```
SAPO Emprego Autofill/Shared (Extension)/Resources/
```

**Important**: Files in this directory are copies, not the source of truth!

**Workflow**:
1. Edit files at root level
2. Run `npm run sync` to copy to Xcode project
3. Build in Xcode

This prevents accidentally editing the wrong copy and losing changes.

## Build System

### NPM Scripts

```bash
npm run build          # Generate fileData.js from assets
npm run sync           # Sync files to Xcode project
npm run build-and-sync # Build and sync in one command
npm run setup          # Initial setup after cloning
npm run generate-icons # Generate icon files
npm run rebuild        # Force rebuild (cleans and reopens Xcode)
npm run help           # Show available commands
```

### Build Process

1. **Generate File Data**
   ```bash
   npm run build
   ```
   - Reads `assets/photo.png` and `assets/CV.pdf`
   - Converts to base64
   - Generates `fileData.js`

2. **Sync to Xcode**
   ```bash
   npm run sync
   ```
   - Copies extension files from root to Xcode project
   - Updates `Shared (Extension)/Resources/`

3. **Build in Xcode**
   - Open `SAPO Emprego Autofill.xcodeproj`
   - Clean Build Folder (⇧ + ⌘ + K)
   - Build and Run (⌘ + R)

## Git Strategy

### Files Tracked in Git

✅ Committed:
- All source code (`.js`, `.html`, `.css`)
- Documentation (`.md` files)
- Scripts (`scripts/`)
- Icons (`.png`, `.svg`)
- Example files (`*.example.js`)
- Configuration files (`.gitignore`, `package.json`, `manifest.json`)

### Files NOT Tracked (Personal Data)

❌ Gitignored:
- `userData.js` - Your personal information
- `fileData.js` - Your encoded files
- `assets/photo.png` - Your photo
- `assets/CV.pdf` - Your CV
- Xcode user data and build artifacts
- Node modules

This allows:
- Safe sharing of code on GitHub
- Each user can add their own personal data
- No risk of accidentally committing sensitive information

## Development Workflow

### First Time Setup

1. Clone repository
2. Copy example files:
   ```bash
   cp userData.example.js userData.js
   cp fileData.example.js fileData.js
   ```
3. Edit `userData.js` with your info
4. Add your files to `assets/`
5. Generate and sync:
   ```bash
   npm run setup
   ```

### Making Changes

1. **Edit extension files at root**
   - `content.js`, `popup.js`, etc.

2. **Sync to Xcode**
   ```bash
   npm run sync
   ```

3. **Rebuild in Xcode**
   - Clean Build Folder (⇧ + ⌘ + K)
   - Build and Run (⌘ + R)

4. **Test in Safari**
   - Extension loads automatically
   - Navigate to SAPO Emprego
   - Test functionality

### Updating Personal Data

**Change personal info (name, email, phone)**:
1. Edit `userData.js`
2. Run `npm run sync`
3. Rebuild in Xcode

**Change files (photo, CV)**:
1. Replace files in `assets/`
2. Run `npm run build-and-sync`
3. Rebuild in Xcode

## Architecture

### Content Script Flow

```
Page Load
    ↓
content.js injected
    ↓
Loads userData.js & fileData.js
    ↓
Waits for user click
    ↓
Single click → Auto-fill form
Double click → Open popup
```

### Data Flow

```
assets/         →  [build-files.js]  →  fileData.js
    photo.png                             (base64)
    CV.pdf

userData.js  →  manifest.json  →  content.js  →  Form Fill
                (load order)
```

### Extension Components

1. **Background Script** (`background.js`)
   - Minimal in this extension
   - Handles extension lifecycle

2. **Content Script** (`content.js`)
   - Main logic for form filling
   - Detects form fields
   - Fills data and uploads files
   - Click event handlers

3. **Popup** (`popup.html`, `popup.js`, `popup.css`)
   - UI for editing data
   - File upload interface
   - Save functionality

## File Size Considerations

- Base64 encoding increases file size by ~33%
- Keep CV under 5MB (recommended)
- Keep photo under 2MB (recommended)
- Total extension should stay under 10MB

## Safari Extension Requirements

- Must be wrapped in Xcode project (macOS)
- Requires code signing for distribution
- Must request permissions explicitly
- Limited to specified host permissions

## Maintenance

### Regular Tasks

- Keep dependencies updated (if any added)
- Test on Safari updates
- Review and update documentation
- Clean Xcode derived data periodically

### Troubleshooting

If files aren't updating in Xcode:
1. Run `npm run sync` to ensure files are copied
2. Clean Build Folder in Xcode
3. Check file permissions
4. Review console for errors

See [docs/INSTALLATION.md](INSTALLATION.md) for more troubleshooting.

## Future Improvements

Potential enhancements:
- [ ] Add TypeScript support
- [ ] Add automated testing
- [ ] Create Chrome extension version
- [ ] Add CI/CD pipeline
- [ ] Implement settings sync across devices

## Resources

- [Safari Web Extensions Documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [Extension Manifest V3](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json)
- [Content Scripts Guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts)

---

**Last Updated**: November 2025

