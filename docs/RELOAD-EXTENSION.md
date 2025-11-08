# How to Properly Reload the Extension

## The Issue
Safari often caches the old version of the extension. You need to force a complete reload.

## Steps to Force Reload:

### 1. Quit Safari Completely
```
⌘Q (Safari > Quit Safari)
```
Don't just close the window - fully quit the application.

### 2. Rebuild in Xcode
```bash
# In Xcode:
1. Select the extension target
2. Press ⌘B to clean build
3. Or Product > Clean Build Folder (⇧⌘K)
4. Then press ⌘R to build and run
```

### 3. Safari Will Reopen
- It should open automatically when you run from Xcode
- If not, open it manually

### 4. Enable Extension (if needed)
```
Safari > Settings > Extensions
Check: ✅ SAPO Emprego Autofill
```

### 5. Hard Refresh the SAPO Page
```
⌘⇧R (not just ⌘R)
```
This clears the page cache.

### 6. Check Console
Open Web Inspector: `⌘⌥I`

You MUST see these messages:
```
SAPO Autofill Extension loaded
Setting up click listeners...
✓ Found form element: <form>
✓ Click listeners attached successfully to: FORM
  Try clicking anywhere on the form to test!
```

## If You Still Don't See These Messages:

### Option A: Check if Extension is Running
1. In Safari, right-click the extension icon in toolbar
2. Click "Inspect Extension Background Page"
3. Look for any errors

### Option B: Check Extension is Enabled for This Site
1. Safari > Settings for emprego.sapo.pt
2. Check if extension has permissions

### Option C: Verify manifest.json
Check that content_scripts includes sapo.pt:
```json
"content_scripts": [
  {
    "matches": [
      "*://*.sapo.pt/*",
      "*://sapo.pt/*",
      "*://*.emprego.sapo.pt/*",
      "*://emprego.sapo.pt/*"
    ],
    "js": ["userData.js", "fileData.js", "content.js"],
    "run_at": "document_idle"
  }
]
```

## Alternative: Use Web Extension (Non-Safari)

If Safari keeps caching, you can test in Chrome/Edge first:

### For Chrome:
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your extension folder
5. Test on SAPO site

This helps verify if the issue is Safari-specific or code-specific.

