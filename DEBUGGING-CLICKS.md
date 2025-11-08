# Debugging Click Functionality

## How to Test if Click Detection is Working

### Step 1: Open Browser Console
1. Open Safari and navigate to a SAPO Emprego job page
2. Open Web Inspector: `Develop > Show Web Inspector` (or `Cmd+Option+I`)
3. Go to the **Console** tab

### Step 2: Check if Extension Loaded
You should see these messages when the page loads:
```
SAPO Autofill Extension loaded
✓ Found form element: <form>
✓ Click listeners attached successfully
```

If you see these, the extension is working! ✅

### Step 3: Test Single Click
1. Click anywhere on the form (NOT on an input field or button)
2. Watch the console. You should see:
```
✓ Single click detected - autofilling...
Loading saved data from storage...
Using Chrome chrome.storage API (or Firefox browser.storage)
Storage data retrieved: { hasFormData: true, hasFileData: true }
✓ Found saved data, starting autofill...
Starting autofill with popup data...
```

### Step 4: Test Double Click
1. Double-click anywhere on the form (NOT on an input field or button)
2. Watch the console. You should see:
```
✓ Double-click detected - opening popup...
Attempting to open popup...
Sending message via chrome.runtime (or browser.runtime)
```

## Common Issues & Solutions

### Issue: "Click ignored - interactive element"
**What it means**: You clicked on an input field, button, or other interactive element
**Solution**: Click on the form background, labels, or other non-interactive areas

### Issue: "No storage API available"
**What it means**: Extension doesn't have storage permissions
**Solution**: 
1. Check that the extension is enabled in Safari Settings > Extensions
2. Rebuild the extension in Xcode
3. Make sure `manifest.json` includes `"storage"` in permissions

### Issue: "No saved data found"
**What it means**: You haven't saved any data yet
**Solution**: 
1. Double-click the form to open popup
2. Fill in your information
3. Click "Save Data"
4. Try single-click again

### Issue: No console messages at all
**What it means**: Extension isn't loading on the page
**Solution**:
1. Check if you're on a `*.sapo.pt` domain (extension only works there)
2. Reload the page
3. Rebuild and reinstall the extension

### Issue: "⚠ No form found, attaching to document body"
**What it means**: Extension couldn't find a `<form>` element
**Solution**: This is OK! The extension will still work on the entire page

## Testing Checklist

- [ ] Open Safari Web Inspector Console
- [ ] Navigate to SAPO Emprego job page
- [ ] Verify "SAPO Autofill Extension loaded" appears
- [ ] Verify "Click listeners attached successfully" appears
- [ ] Single-click form background (not inputs) - should trigger autofill
- [ ] Double-click form background - should attempt to open popup
- [ ] Check if data is saved: Open extension popup manually and verify fields are filled
- [ ] Try clicking on input fields - should be ignored
- [ ] Try clicking on buttons - should be ignored

## Expected Console Output (Normal Flow)

### On Page Load:
```
SAPO Autofill Extension loaded
✓ Found form element: <form class="application-form">
✓ Click listeners attached successfully
```

### On Single Click:
```
✓ Single click detected - autofilling...
Loading saved data from storage...
Using Chrome chrome.storage API
Storage data retrieved: { hasFormData: true, hasFileData: true }
✓ Found saved data, starting autofill...
Starting autofill with popup data...
✓ Filled name field
✓ Filled email field
✓ Filled phone field
✓ Uploaded photo file: photo.png
✓ Uploaded cv file: CV.pdf
✓ Checkbox is NOW checked via visible element!
✓ Found submit button - clicking...
```

### On Double Click:
```
✓ Double-click detected - opening popup...
Attempting to open popup...
Sending message via chrome.runtime
```

## Advanced Debugging

### Check if Storage Has Data
Run this in console:
```javascript
chrome.storage.local.get(['formData', 'fileData'], (data) => {
  console.log('Stored data:', data);
});
```

You should see:
```javascript
{
  formData: { name: "...", email: "...", phone: "..." },
  fileData: { 
    photo: { name: "photo.png", type: "image/png", base64: "..." },
    cv: { name: "CV.pdf", type: "application/pdf", base64: "..." }
  }
}
```

### Manually Trigger Single Click
Run this in console:
```javascript
// Find the click handler function and trigger it
document.querySelector('form').click();
```

### Manually Trigger Double Click
Run this in console:
```javascript
// Find the double-click handler and trigger it
document.querySelector('form').dispatchEvent(new Event('dblclick'));
```

## Still Not Working?

If you've tried everything and it's still not working:

1. **Check extension is enabled**: Safari > Settings > Extensions > SAPO Emprego Autofill (should be checked)
2. **Rebuild in Xcode**: Open project, press `Cmd+R` to rebuild
3. **Clear browser cache**: Safari > Clear History...
4. **Check domain**: Extension only works on `*.sapo.pt` URLs
5. **Check console for errors**: Look for red error messages

## Report Issues

When reporting issues, include:
- [ ] Browser: Safari version
- [ ] Full console output (copy all messages)
- [ ] URL you're testing on
- [ ] Steps you took
- [ ] What you expected vs what happened

