# Quick Test Guide for Click Functionality

## Step-by-Step Testing

### 1. Rebuild the Extension
```bash
# Open Xcode
open "SAPO Emprego Autofill/SAPO Emprego Autofill.xcodeproj"

# Press ⌘R to build and run
```

### 2. Open Safari Web Inspector
1. Go to Safari
2. Navigate to any SAPO Emprego job page
3. Press `⌘ + ⌥ + I` to open Web Inspector
4. Click the **Console** tab

### 3. Check Initial Load Messages
You should see these messages in console:
```
SAPO Autofill Extension loaded
Setting up click listeners...
✓ Found form element: <form>
  Tag: FORM Class: ink-form
✓ Click listeners attached successfully to: FORM
  Try clicking anywhere on the form to test!
```

✅ If you see these, the extension is loaded correctly!

### 4. Test Raw Click Events

**Click anywhere on the page** (even on an input field first, just to test).

You should see:
```
🔵 RAW CLICK EVENT detected on: [element type]
```

**Important**: 
- If you see 🔵 messages → Events ARE firing! ✅
- If you DON'T see 🔵 messages → Events are NOT firing ❌

### 5. Test Click on Form Background

**Click on a NON-interactive part of the form** (like white space, labels, or div containers).

You should see:
```
🔵 RAW CLICK EVENT detected on: DIV (or LABEL, SPAN, etc.)
handleFormClick triggered [element]
isInteractive: false for DIV
Click accepted - processing...
```

Then after 300ms:
```
✓ Single click detected - autofilling...
Loading saved data from storage...
```

### 6. Test Double-Click

**Double-click on a NON-interactive part of the form**.

You should see:
```
🔵 RAW CLICK EVENT detected on: DIV
🔵 RAW DBLCLICK EVENT detected on: DIV
handleFormClick triggered [element]
handleFormDoubleClick triggered [element]
Double-click accepted - processing...
✓ Double-click detected - opening popup...
```

## What to Look For

### Scenario A: No 🔵 messages at all
**Problem**: Events aren't firing
**Solution**: The form element might not be found or listeners not attached
**Debug**: Check if "✓ Click listeners attached successfully" appears

### Scenario B: 🔵 appears but "Click ignored - interactive element"
**Problem**: You're clicking on an input/button
**Solution**: Click on labels, divs, or form background instead

### Scenario C: 🔵 appears, click accepted, but no autofill
**Problem**: Storage might be empty or autofill function has errors
**Solution**: Check storage data (see below)

### Scenario D: Popup opens on single click
**Problem**: The dblclick handler is triggering on single click
**Solution**: This would show in the detailed logs

## Check Storage Data

Run this in console to see if data is saved:
```javascript
chrome.storage.local.get(['formData', 'fileData'], (data) => {
  console.log('📦 Storage contents:', data);
  if (data.formData) console.log('✅ Form data exists');
  if (data.fileData) console.log('✅ File data exists');
  if (!data.formData && !data.fileData) console.log('❌ No data saved yet!');
});
```

## Manual Save Data

If no data exists, save some test data:
```javascript
chrome.storage.local.set({
  formData: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '123456789'
  },
  fileData: {
    photo: { name: 'photo.png', type: 'image/png', base64: 'test' },
    cv: { name: 'CV.pdf', type: 'application/pdf', base64: 'test' }
  }
}, () => {
  console.log('✅ Test data saved!');
});
```

## Expected Full Console Output (Single Click on Label)

```
SAPO Autofill Extension loaded
Setting up click listeners...
✓ Found form element: <form>
✓ Click listeners attached successfully to: FORM
  Try clicking anywhere on the form to test!

[USER CLICKS ON A LABEL]

🔵 RAW CLICK EVENT detected on: LABEL <label>
handleFormClick triggered <label>
Target has no matches function
isInteractive: false for LABEL
Click accepted - processing...

[AFTER 300ms]

✓ Single click detected - autofilling...
Loading saved data from storage...
Using Chrome chrome.storage API
Storage data retrieved: { hasFormData: true, hasFileData: true }
✓ Found saved data, starting autofill...
Starting autofill with popup data...
✓ Filled name field
✓ Filled email field
✓ Filled phone field
```

## Expected Full Console Output (Double Click on Label)

```
[USER DOUBLE-CLICKS ON A LABEL]

🔵 RAW CLICK EVENT detected on: LABEL <label>
🔵 RAW DBLCLICK EVENT detected on: LABEL <label>
handleFormClick triggered <label>
handleFormDoubleClick triggered <label>
isInteractive: false for LABEL
Click accepted - processing...
Double-click accepted - processing...
✓ Double-click detected - opening popup...
Attempting to open popup...
Sending message via chrome.runtime
```

## Troubleshooting Commands

### Test if extension can access storage:
```javascript
typeof chrome !== 'undefined' && chrome.storage ? console.log('✅ Storage API available') : console.log('❌ No storage API');
```

### Test if extension can send messages:
```javascript
chrome.runtime.sendMessage({ action: 'test' }, (response) => {
  if (chrome.runtime.lastError) {
    console.log('❌ Message sending failed:', chrome.runtime.lastError);
  } else {
    console.log('✅ Message sent successfully');
  }
});
```

### Force trigger autofill manually:
```javascript
// In console, run:
document.querySelector('form').click();
```

## Report Your Results

When reporting issues, include:
1. The EXACT console output (copy/paste)
2. What you clicked on
3. What you expected vs what happened
4. Whether you see 🔵 messages or not

This will help diagnose the exact issue!

