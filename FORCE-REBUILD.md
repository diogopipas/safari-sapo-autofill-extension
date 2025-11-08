# Force Clean Rebuild - Safari Extension

## The Problem
Safari/Xcode may cache old JavaScript files. You need to force a complete rebuild.

## Step-by-Step Clean Rebuild

### 1. Quit Safari Completely
```
⌘ + Q (Command + Q)
```
**Important**: Make sure Safari is fully quit, not just closed windows!

### 2. Open Xcode
```bash
cd "/Users/diogoporto/Documents/safari-sapo-autofill-extension"
open "SAPO Emprego Autofill/SAPO Emprego Autofill.xcodeproj"
```

### 3. Clean Build Folder
In Xcode menu:
```
Product → Clean Build Folder
```
Or press: **⇧ + ⌘ + K** (Shift + Command + K)

Wait for "Clean Finished" message.

### 4. Build and Run
Press: **⌘ + R** (Command + R)

Safari will launch automatically.

### 5. Enable Extension (if needed)
1. Safari → Settings (⌘ + ,)
2. Go to **Extensions** tab
3. Check **☑ SAPO Emprego Autofill**
4. Make sure "Allow" is set for sapo.pt

### 6. Test Immediately

1. Go to any SAPO Emprego job page
2. Open Web Inspector: **⌘ + ⌥ + I**
3. Go to **Console** tab
4. You should now see:

```
SAPO Autofill Extension loaded
Setting up click listeners...
✓ Found form element: <form data-v-278fba68 method="get" class="ink-form">
  Tag: FORM Class: ink-form
✓ Click listeners attached successfully to: FORM
  Try clicking anywhere on the form to test!
```

### 7. Click Test

**Click anywhere on the page** (even on an input, just to test events are working).

You MUST see:
```
🔵 RAW CLICK EVENT detected on: INPUT (or whatever you clicked)
```

### 8. If Still No 🔵 Messages

If you don't see the 🔵 (blue circle) messages:

#### A. Check Extension is Actually Running
In Console, type:
```javascript
console.log('Test from console');
```
If this works, the console is fine.

#### B. Check if content.js loaded
Look at the Sources/Debugger tab in Web Inspector. You should see:
- `content.js`
- `userData.js`
- `fileData.js`

#### C. Force Reload Page
Press **⌘ + R** to reload the page.

Look for "SAPO Autofill Extension loaded" again.

#### D. Check Extension Permissions
Safari → Settings → Extensions → SAPO Emprego Autofill
- Should show "emprego.sapo.pt" in allowed sites
- "Always Allow" should be selected

### 9. If You See 🔵 Messages - SUCCESS!

Once you see 🔵 messages, the events are working!

Now test:
1. **Click on a LABEL or empty space** (not an input)
2. You should see:
```
🔵 RAW CLICK EVENT detected on: LABEL
handleFormClick triggered [label element]
isInteractive: false for LABEL
Click accepted - processing...
```

Then after 300ms:
```
✓ Single click detected - autofilling...
```

### 10. Test Double-Click

**Double-click on a LABEL or empty space**.

You should see:
```
🔵 RAW CLICK EVENT detected on: LABEL
🔵 RAW DBLCLICK EVENT detected on: LABEL
handleFormClick triggered
handleFormDoubleClick triggered
✓ Double-click detected - opening popup...
```

## Still Not Working?

If after clean rebuild you still don't see 🔵 messages:

1. **Check the file was actually updated**:
   - In Web Inspector → Sources/Debugger
   - Find `content.js`
   - Search for "RAW CLICK EVENT" (⌘ + F)
   - If you can't find it, the old file is still being used

2. **Try deleting derived data**:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```
Then rebuild in Xcode.

3. **Check Safari is actually using the new extension**:
   - Quit Safari (⌘ + Q)
   - In Xcode, Clean Build Folder (⇧ + ⌘ + K)
   - Build and Run (⌘ + R)

4. **Verify the extension loaded**:
   - Open Safari
   - Go to Develop menu
   - Look for "SAPO Emprego Autofill" in the menu
   - You should see the extension listed for emprego.sapo.pt pages

## Quick Verification Script

Run this in the console to check if the new code loaded:
```javascript
// Check if debug function exists
if (window.addEventListener) {
  const testForm = document.querySelector('form');
  if (testForm) {
    console.log('✅ Form found:', testForm);
    // Try clicking it programmatically
    testForm.click();
    console.log('👆 Programmatic click sent - check for 🔵 message above');
  }
}
```

## Debug Checklist

- [ ] Safari completely quit (⌘ + Q)
- [ ] Xcode: Clean Build Folder (⇧ + ⌘ + K)
- [ ] Xcode: Build and Run (⌘ + R)
- [ ] Safari: Extension enabled in Settings
- [ ] Web Inspector: Console open
- [ ] Console shows: "SAPO Autofill Extension loaded"
- [ ] Console shows: "✓ Click listeners attached successfully"
- [ ] Click anywhere → See 🔵 RAW CLICK EVENT messages
- [ ] Click on label/empty space → See "handleFormClick triggered"
- [ ] Storage has data (run storage check from TEST-CLICKS.md)

If ALL checkboxes are ✅ and you still don't see autofill working, then the issue is in the autofill logic itself, not the click detection.

