# Testing Checklist for SAPO Autofill Extension

Use this checklist to verify that the extension works correctly.

## Pre-Testing Setup

- [ ] Extension converted to Safari Web Extension using `xcrun safari-web-extension-converter`
- [ ] Xcode project opened and building successfully
- [ ] Extension running in Safari (via Xcode's Run command ⌘R)
- [ ] Xcode app kept running in the background
- [ ] Extension enabled in Safari > Settings > Extensions
- [ ] Extension has permissions for sapo.pt domains

## Initial Load Test

- [ ] Extension icon appears in Safari toolbar
- [ ] Icon is visible and properly sized
- [ ] Clicking icon doesn't cause any errors (check Console)

## Form Field Tests

Navigate to a SAPO Emprego job application page and click the extension button:

### Text Fields
- [ ] **Name field** filled with: "Diogo Guerreiro Porto"
- [ ] **Email field** filled with: "diogo.g.portob@gmail.com"
- [ ] **Phone field** filled with: "933949061"
- [ ] All text fields show the correct values
- [ ] No text fields are left empty or contain wrong data

### File Uploads
- [ ] **Photo** file input shows "photo.png"
- [ ] **CV** file input shows "CV.pdf"
- [ ] Photo preview appears (if applicable)
- [ ] File sizes are reasonable (photo ~1.7MB, CV ~117KB in base64)

### Checkbox
- [ ] Terms and conditions checkbox is checked
- [ ] Checkbox remains checked after clicking

### Form Submission
- [ ] Submit button is found and clicked automatically
- [ ] OR: Notification indicates submit button not found (if different page structure)
- [ ] Form appears to be submitting (loading indicator, redirect, etc.)

## Console Output Test

Open Web Inspector (Develop > Show Web Inspector > Console) and verify:

- [ ] "SAPO Autofill Extension loaded" appears when page loads
- [ ] "Starting autofill process..." appears after clicking button
- [ ] "✓ Filled name field" appears
- [ ] "✓ Filled email field" appears
- [ ] "✓ Filled phone field" appears
- [ ] "✓ Uploaded photo file: photo.png" appears
- [ ] "✓ Uploaded cv file: CV.pdf" appears
- [ ] "✓ Checked terms and conditions" appears
- [ ] "✓ Found submit button - clicking..." appears
- [ ] "Autofill completed successfully!" appears
- [ ] No red error messages appear

## Visual Notification Test

- [ ] Green success notification appears in top-right corner
- [ ] Notification shows appropriate message
- [ ] Notification automatically disappears after a few seconds
- [ ] No error (red) notifications appear

## Edge Cases

### Different Form Structures
Test on multiple SAPO Emprego job listings to verify:
- [ ] Extension works on different job application forms
- [ ] Gracefully handles missing fields
- [ ] Doesn't fill unrelated forms

### Multiple Clicks
- [ ] Clicking extension button twice doesn't break the form
- [ ] Fields can be refilled if manually changed
- [ ] No duplicate file uploads occur

### Page Timing
- [ ] Works if clicked immediately after page loads
- [ ] Works if clicked after waiting on the page
- [ ] Works if form is partially filled manually first

## Error Scenarios

Test these scenarios to ensure graceful handling:

### Wrong Domain
- [ ] Extension button doesn't work on non-SAPO pages
- [ ] No errors in console on non-SAPO pages

### Modified Form
If SAPO changes their form:
- [ ] Extension doesn't crash
- [ ] Console shows which fields were found/not found
- [ ] Partial autofill works for available fields

## Performance

- [ ] Autofill completes within 2-3 seconds
- [ ] No noticeable lag or freezing
- [ ] Browser remains responsive during autofill
- [ ] Page doesn't crash or reload unexpectedly

## Security

- [ ] Extension only activates on sapo.pt domains
- [ ] No network requests to external servers
- [ ] No data sent outside of the form submission
- [ ] Files remain in base64 format until form submission

## Final Verification

After running all tests:

- [ ] At least one complete job application submitted successfully
- [ ] All personal information correct on submitted form
- [ ] CV and photo properly attached
- [ ] Received confirmation from SAPO (email or on-screen)

## Known Limitations

Document any issues found:

| Issue | Description | Workaround |
|-------|-------------|------------|
| | | |
| | | |

## Notes

Use this space for any observations or issues:

```
[Add your notes here]
```

## Success Criteria

Extension is ready to use when:
- ✅ All "Form Field Tests" pass
- ✅ All "Console Output Tests" pass
- ✅ No errors appear during normal operation
- ✅ At least one successful form submission

## Next Steps After Testing

If all tests pass:
1. Use the extension for real job applications
2. Monitor for any SAPO form changes
3. Update extension if form structure changes

If tests fail:
1. Check console for specific errors
2. Review field selectors in `content.js`
3. Update selectors to match current SAPO form structure
4. Re-run tests

## Report Issues

If you encounter problems:
1. Note the specific test that failed
2. Copy error messages from console
3. Take screenshots of the form
4. Document the job listing URL
5. Update `content.js` with fixes as needed

