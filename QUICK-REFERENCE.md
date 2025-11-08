# Quick Reference Guide

## Click-to-Fill Feature - At a Glance

### 🎯 Single Click → Instant Autofill

```
┌─────────────────────────────────────┐
│  SAPO Emprego Job Application Form  │
│                                     │
│  ┌───────────────┐                 │
│  │   [CLICK]     │ ← Single Click  │
│  └───────────────┘                 │
│                                     │
│  ⚡ INSTANTLY FILLS:                │
│  ✓ Name: João Silva                │
│  ✓ Email: joao@example.com         │
│  ✓ Phone: 912345678                │
│  ✓ Photo: photo.png                │
│  ✓ CV: CV.pdf                      │
│  ✓ Terms: [✓] Accepted             │
│                                     │
└─────────────────────────────────────┘
```

### 🖱️ Double Click → Open Settings

```
┌─────────────────────────────────────┐
│  SAPO Emprego Job Application Form  │
│                                     │
│  ┌───────────────┐                 │
│  │ [DOUBLE-CLICK]│ ← Double Click  │
│  └───────────────┘                 │
│           │                         │
│           ↓                         │
│  ┌─────────────────────────────┐   │
│  │   Extension Popup Opens     │   │
│  │                             │   │
│  │  Edit Your Information:     │   │
│  │  • Name                     │   │
│  │  • Email                    │   │
│  │  • Phone                    │   │
│  │  • Upload Photo             │   │
│  │  • Upload CV                │   │
│  │                             │   │
│  │  [Save Data] [Fill Form]    │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

## Three Ways to Use the Extension

### Method 1: Click-to-Fill (FASTEST) ⚡
```
Navigate to job page → Single-click form → Done!
```

### Method 2: Quick Fill Button
```
Navigate to job page → Click extension icon → Click "Quick Fill" → Done!
```

### Method 3: Manual Fill & Edit
```
Navigate to job page → Click extension icon → Edit data → Click "Fill Form" → Done!
```

## First Time Setup

```
Step 1: Go to SAPO job page
   ↓
Step 2: Double-click the form (or click extension icon)
   ↓
Step 3: Fill in your information
   • Name
   • Email
   • Phone
   • Upload photo
   • Upload CV
   ↓
Step 4: Click "Save Data"
   ↓
Step 5: Next time, just single-click to autofill!
```

## Keyboard Shortcuts & Tips

| Action | Method |
|--------|--------|
| Quick Autofill | Single-click form |
| Edit Settings | Double-click form |
| Open Popup | Click extension icon |
| Save Changes | Click "Save Data" in popup |
| Quick Fill | Click "⚡ Quick Fill" button |

## What Gets Ignored

The extension ignores clicks on:
- ❌ Buttons
- ❌ Links
- ❌ Submit buttons
- ❌ Other clickable controls

This ensures normal form interaction isn't disrupted!

## Notifications

| Notification | Meaning |
|-------------|---------|
| "Form filled successfully!" | ✅ Autofill completed |
| "No saved data found. Double-click..." | ⚠️ Need to save data first |
| "Opening settings..." | ℹ️ Popup is opening |
| "Error loading saved data..." | ❌ Something went wrong |

## Browser Differences

### Firefox
- ✅ Popup opens automatically on double-click

### Chrome / Safari / Edge
- ⚠️ May show notification: "Please click the extension icon to edit your data"
- This is due to browser security restrictions
- Simply click the extension icon to open popup

## Troubleshooting

### Issue: Form not filling on single-click
**Solution**: 
1. Double-click to open settings
2. Verify data is saved
3. Try single-click again

### Issue: Double-click not opening popup
**Solution**: 
1. Check for notification message
2. Click extension icon manually
3. Browser may have restrictions

### Issue: Wrong data is filling
**Solution**: 
1. Double-click form to open settings
2. Update your information
3. Click "Save Data"

## Privacy & Security

- 🔒 All data stored locally in your browser
- 🔒 No external servers involved
- 🔒 Only works on SAPO Emprego domains
- 🔒 Your data never leaves your computer

## Quick Commands

```bash
# Build the extension (if you have source code)
node build-files.js

# Open in Xcode (macOS)
open "SAPO Emprego Autofill/SAPO Emprego Autofill.xcodeproj"

# Build in Xcode
# Press ⌘R to build and run
```

## Need More Help?

- 📖 Full documentation: [README.md](README.md)
- 🎯 Click feature details: [CLICK-FEATURE.md](CLICK-FEATURE.md)
- 📝 Usage guide: [USAGE.md](USAGE.md)
- 🔧 Setup instructions: [SETUP.md](SETUP.md)
- 💻 Installation guide: [INSTALLATION.md](INSTALLATION.md)

---

**Happy job hunting! 🚀**

