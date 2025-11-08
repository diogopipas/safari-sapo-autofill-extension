# Setup Guide - Personal Data Configuration

This guide explains how to set up your personal information for the SAPO Autofill Extension.

## Why This Setup?

To keep your personal information private when sharing code on GitHub, your personal data is stored in separate files that are excluded from version control via `.gitignore`.

## Initial Setup Steps

### 1. Configure Your Personal Information

Copy the example file and add your information:

```bash
cp userData.example.js userData.js
```

Then edit `userData.js` with your information:

```javascript
const FORM_DATA = {
  name: 'Your Full Name',
  email: 'your.email@example.com',
  phone: 'Your Phone Number'
};
```

### 2. Add Your Files

Place your personal files in the `assets/` folder:

- `assets/photo.png` - Your profile photo
- `assets/CV.pdf` - Your CV/Resume

### 3. Generate File Data

Run the build script to convert your files to base64:

```bash
node scripts/build-files.js
```

This will create `fileData.js` with your embedded files.

### 4. Build the Extension

Follow the instructions in [INSTALLATION.md](INSTALLATION.md) to build and install the extension in Safari.

## What's Excluded from Git?

The following files contain your personal data and are **NOT committed** to the repository:

- ❌ `userData.js` - Your name, email, and phone
- ❌ `fileData.js` - Your photo and CV (base64 encoded)
- ❌ `assets/photo.png` - Your photo
- ❌ `assets/CV.pdf` - Your CV

## What's Included in Git?

The following files are safe to share:

- ✅ `userData.example.js` - Template for personal info
- ✅ `fileData.example.js` - Template for file data
- ✅ `content.js` - Extension logic (no personal data)
- ✅ `scripts/build-files.js` - Build script
- ✅ All other extension files

## Updating Your Information

To update your personal information:

1. Edit `userData.js` to change name, email, or phone
2. Replace files in `assets/` folder if needed
3. Run `node scripts/build-files.js` if you changed files
4. Reload the extension in Safari

## Security Notes

✓ Your data never leaves your computer
✓ No external servers or APIs are involved
✓ Your data is as secure as your local file system
✓ Your personal data is NOT shared when you push to GitHub

## First Time Using This Repository?

If you cloned this repository, you'll need to:

1. Create `userData.js` from the example
2. Add your files to `assets/`
3. Run `node scripts/build-files.js`
4. Build in Xcode

See [INSTALLATION.md](INSTALLATION.md) for complete installation instructions.

