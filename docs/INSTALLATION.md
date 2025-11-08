# Safari SAPO Autofill Extension - Installation & Usage Guide

## Prerequisites

> **Important:** Before installing, you must configure your personal data. See `SETUP.md` for detailed instructions.

**Quick setup:**
1. Copy `userData.example.js` to `userData.js` and add your info
2. Add your `photo.png` and `CV.pdf` to the `assets/` folder
3. Run `node build-files.js` to generate file data

## Installation Steps

> **Note:** Safari 14+ (macOS Big Sur and newer) uses Safari Web Extensions built with Xcode. The old "Extension Builder" tool has been removed.

### Method 1: Using Xcode (Recommended for Safari 14+)

#### Step 1: Convert to Safari Web Extension

1. Open **Terminal**
2. Navigate to the extension directory:
   ```bash
   cd /Users/diogoporto/Documents/safari-sapo-autofill-extension
   ```
3. Convert the extension using Apple's converter:
   ```bash
   xcrun safari-web-extension-converter .
   ```
4. Follow the prompts:
   - Enter app name: **SAPO Autofill**
   - Choose a location to save the Xcode project

#### Step 2: Build and Run in Xcode

1. Open the generated `.xcodeproj` file in **Xcode**
2. Select your Mac as the build target
3. Click **Product > Run** (or press ⌘R)
4. Xcode will build and launch Safari with the extension

#### Step 3: Enable the Extension

1. Safari will open automatically
2. Go to **Safari > Settings > Extensions**
3. Find **"SAPO Emprego Autofill"** in the list
4. Check the box to enable it
5. Click **"Always Allow on Every Website"** or configure for **sapo.pt** only

### Method 2: Temporary Loading (Development Only)

For quick testing without Xcode:

1. Open **Safari**
2. Go to **Safari > Settings > Advanced**
3. Check **"Show features for web developers"**
4. Go to **Develop > Allow Unsigned Extensions**
5. Convert and load as described in Method 1

### Legacy: Safari 13 and Earlier (macOS Catalina and older)

<details>
<summary>Click to expand legacy instructions</summary>

1. Enable Developer Features: **Safari > Preferences > Advanced** → Check "Show Develop menu"
2. Go to **Develop > Show Extension Builder**
3. Click **"+"** → **"Add Extension..."**
4. Select the extension folder
5. Click **"Run"**

</details>

## How to Use

1. Navigate to a SAPO Emprego job application page (e.g., `https://emprego.sapo.pt/...`)
2. Click the **SAPO Emprego Autofill** button in Safari's toolbar
   - The button should appear as a blue icon with a form and checkmark
3. The extension will automatically:
   - Fill in your name, email, and phone (from `userData.js`)
   - Upload your photo from `assets/photo.png`
   - Upload your CV from `assets/CV.pdf`
   - Check the terms and conditions checkbox
   - Click the submit button
4. A notification will appear confirming the autofill process
5. **Important:** Always verify the form before final submission!

## Troubleshooting

### Extension doesn't appear in toolbar
- Make sure the extension is enabled in Safari > Settings > Extensions
- Try restarting Safari
- If using Xcode: Make sure the app is still running
- Check Safari's Console for any extension loading errors

### Form fields aren't being filled
- Open Safari's Web Inspector (Develop > Show Web Inspector)
- Go to the Console tab
- Click the extension button and look for error messages
- The console will show which fields were found and filled

### File uploads aren't working
- Check the browser console for errors
- Some websites may block programmatic file uploads for security
- The extension converts files to base64 and creates File objects, but some forms may require manual file selection

### Submit button doesn't click
- The extension looks for buttons with "ENVIAR CANDIDATURA" or "ENVIAR" text
- If your form has a different button text, the auto-submit may not work
- In this case, verify the filled data and click submit manually

### Extension works on wrong pages
- The extension is configured to only work on `*.sapo.pt` domains
- If it's triggering on other sites, check the `manifest.json` permissions

## Debugging

To see detailed logs of what the extension is doing:

1. Open the job application page
2. Open Web Inspector: **Develop > Show Web Inspector**
3. Click the **Console** tab
4. Click the extension button in the toolbar
5. Watch the console output:
   - ✓ marks indicate successful operations
   - ✗ marks indicate fields that couldn't be found
   - Error messages will appear in red

## Updating the Extension

If you need to modify the autofill data:

### Changing Personal Information

Edit `userData.js` and modify your information:

```javascript
const FORM_DATA = {
  name: 'Your Name Here',
  email: 'your.email@example.com',
  phone: 'Your Phone Number'
};
```

### Changing Files

1. Replace the files in the `assets/` folder:
   - `assets/photo.png` - Your photo
   - `assets/CV.pdf` - Your CV
2. Run the build script to regenerate `fileData.js`:
   ```bash
   node build-files.js
   ```
3. Reload the extension (stop and re-run in Xcode, or use **Develop > Reload Extension**)

### After Making Changes

1. Save your files
2. Reload the extension:
   - **If using Xcode:** Stop and re-run the app (⌘R in Xcode)
   - **If using converted extension:** Rebuild in Xcode or use **Develop > Reload Extension** in Safari
3. Refresh the job application page in Safari
4. Test the extension

## Security & Privacy

This extension stores your personal information and files (as base64) directly in the extension code:

### Security Benefits
- ✓ The data never leaves your computer
- ✓ No external servers or APIs are involved
- ✓ Your data is as secure as your local file system
- ✓ Personal files are excluded from git via `.gitignore`

### Privacy Protection
- ✓ Safe to share on GitHub - personal data files are excluded
- ✓ `userData.js` - NOT committed (contains your info)
- ✓ `fileData.js` - NOT committed (contains your files)
- ✓ `assets/photo.png` & `assets/CV.pdf` - NOT committed

### What Gets Shared
When you commit to GitHub, only these files are included:
- Extension code (`content.js`, `background.js`, etc.)
- Example templates (`userData.example.js`, `fileData.example.js`)
- Documentation and build scripts
- NO personal information or files

## Uninstalling

1. Go to **Safari > Settings > Extensions**
2. Find **"SAPO Emprego Autofill"**
3. Uncheck the box or click **"Uninstall"**
4. Optionally, delete the extension folder from your file system

