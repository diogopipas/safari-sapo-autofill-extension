# Quick Start Guide

Get your SAPO Autofill extension running in 10 minutes!

> **⚠️ Important:** Safari 14+ (macOS Big Sur and newer) requires Xcode to run extensions. The old "Extension Builder" is no longer available.

## Step 1: Convert to Safari Extension (2 minutes)

1. Open **Terminal**
2. Navigate to the extension:
   ```bash
   cd /Users/diogoporto/Documents/safari-sapo-autofill-extension
   ```
3. Convert using Apple's tool:
   ```bash
   xcrun safari-web-extension-converter .
   ```
4. When prompted:
   - App name: **SAPO Autofill**
   - Choose where to save (e.g., Desktop)

## Step 2: Open in Xcode (1 minute)

1. Find the generated **SAPO Autofill.xcodeproj** file
2. Double-click to open in **Xcode**
3. If prompted, trust the project

## Step 3: Build and Run (2 minutes)

1. In Xcode, select **My Mac** as the build target (top toolbar)
2. Click the **▶️ Play** button (or press `⌘R`)
3. Xcode will build and launch Safari automatically
4. Keep the Xcode app running!

## Step 4: Enable in Safari (2 minutes)

1. Safari should open automatically
2. Go to **Safari** menu → **Settings** → **Extensions**
3. Find **"SAPO Emprego Autofill"** in the list
4. Check the box ☑️ to enable it
5. If prompted, click **"Always Allow on sapo.pt"** or **"Always Allow on Every Website"**

## Step 6: Test It! (2 minutes)

1. Go to any SAPO Emprego job listing (e.g., `https://emprego.sapo.pt`)
2. Click on a job to see the application form
3. Look for the extension icon in Safari's toolbar (blue icon with form and checkmark)
4. **Click the extension icon**
5. Watch the magic happen! ✨

The form should automatically fill with:
- Name: Diogo Guerreiro Porto
- Email: diogo.g.portob@gmail.com
- Phone: 933949061
- Photo: photo.png
- CV: CV.pdf
- Terms checkbox: ✓ Checked

## Troubleshooting

### Don't see the extension icon?
- Make sure the Xcode app is still running
- Check Safari > Settings > Extensions - is it enabled?
- Try stopping (⌘.) and re-running (⌘R) in Xcode

### Extension icon is grayed out?
- You need to be on a sapo.pt website
- The extension only works on SAPO Emprego pages

### Form isn't filling?
- Enable Developer features: Safari > Settings > Advanced
- Open Web Inspector: **Develop** → **Show Web Inspector**
- Click the **Console** tab
- Click the extension icon again
- Look for error messages in red

### Need more help?
- See [INSTALLATION.md](INSTALLATION.md) for detailed instructions
- See [TESTING-CHECKLIST.md](TESTING-CHECKLIST.md) for comprehensive testing
- Check console logs for specific errors

## What's Next?

Once it works:
1. Use it for real job applications! 🎯
2. Always verify the filled information before submitting
3. Keep Xcode running when using the extension

Need to change your info?
- Edit `content.js` to change name/email/phone
- Replace files in `assets/` folder and run `node build-files.js`
- Stop and re-run in Xcode (⌘R)

## Success! 🎉

You're all set! The extension will save you time on every SAPO Emprego application.

**Remember**: Always review the form before final submission to ensure everything is correct!

