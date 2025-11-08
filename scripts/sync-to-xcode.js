#!/usr/bin/env node

/**
 * Sync Script - Copy extension files to Xcode project
 * 
 * This script copies all extension source files from the root directory
 * to the Xcode project's Shared (Extension)/Resources directory.
 * 
 * Run this after making changes to extension files to update the Xcode project.
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const xcodeResourcesDir = path.join(
  projectRoot,
  'SAPO Emprego Autofill',
  'Shared (Extension)',
  'Resources'
);

// Files to sync from root to Xcode project
const filesToSync = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.css',
  'popup.js',
  'userData.js',
  'userData.example.js',
  'fileData.js',
  'fileData.example.js'
];

// Directories to sync
const dirsToSync = [
  'icons'
];

console.log('🔄 Syncing extension files to Xcode project...');
console.log('');

// Check if Xcode resources directory exists
if (!fs.existsSync(xcodeResourcesDir)) {
  console.error('❌ Error: Xcode resources directory not found!');
  console.error(`   Expected: ${xcodeResourcesDir}`);
  process.exit(1);
}

let syncedFiles = 0;
let skippedFiles = 0;
let errors = 0;

// Sync individual files
filesToSync.forEach(file => {
  const sourcePath = path.join(projectRoot, file);
  const destPath = path.join(xcodeResourcesDir, file);
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Skipped: ${file} (source not found)`);
    skippedFiles++;
    return;
  }
  
  try {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Synced: ${file}`);
    syncedFiles++;
  } catch (err) {
    console.error(`❌ Error syncing ${file}: ${err.message}`);
    errors++;
  }
});

// Sync directories
dirsToSync.forEach(dir => {
  const sourceDir = path.join(projectRoot, dir);
  const destDir = path.join(xcodeResourcesDir, dir);
  
  if (!fs.existsSync(sourceDir)) {
    console.log(`⚠️  Skipped: ${dir}/ (source not found)`);
    skippedFiles++;
    return;
  }
  
  try {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy all files from source directory
    const files = fs.readdirSync(sourceDir);
    files.forEach(file => {
      // Skip .svg files and hidden files
      if (file.endsWith('.svg') || file.startsWith('.')) {
        return;
      }
      
      const sourceFile = path.join(sourceDir, file);
      const destFile = path.join(destDir, file);
      
      if (fs.statSync(sourceFile).isFile()) {
        fs.copyFileSync(sourceFile, destFile);
      }
    });
    
    console.log(`✓ Synced: ${dir}/ (${files.filter(f => !f.endsWith('.svg') && !f.startsWith('.')).length} files)`);
    syncedFiles++;
  } catch (err) {
    console.error(`❌ Error syncing ${dir}/: ${err.message}`);
    errors++;
  }
});

console.log('');
console.log('📊 Sync Summary:');
console.log(`   ✓ Synced: ${syncedFiles}`);
if (skippedFiles > 0) {
  console.log(`   ⚠️  Skipped: ${skippedFiles}`);
}
if (errors > 0) {
  console.log(`   ❌ Errors: ${errors}`);
}

console.log('');

if (errors > 0) {
  console.log('❌ Sync completed with errors!');
  process.exit(1);
} else {
  console.log('✅ Sync completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Open Xcode project');
  console.log('  2. Clean build (⇧ + ⌘ + K)');
  console.log('  3. Build and run (⌘ + R)');
}

