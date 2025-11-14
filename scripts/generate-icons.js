#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Generate PNG icons for the extension from the frog logo image
const projectRoot = path.join(__dirname, '..');
const sourceImage = path.join(projectRoot, 'assets', 'frog-logo.png');
const iconsDir = path.join(projectRoot, 'icons');

if (!fs.existsSync(sourceImage)) {
  console.error('❌ Error: assets/frog-logo.png not found!');
  console.error('   Make sure the cropped frog logo exists at assets/frog-logo.png.');
  process.exit(1);
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Sizes needed for the extension and Xcode assets
const sizes = [16, 32, 48, 64, 96, 128, 256, 512, 1024];

console.log('🎨 Generating PNG icons from assets/frog-logo.png...');
console.log('📏 Auto-cropping and scaling frog to fill more of the icon...');
console.log('');

// Scale factor: 95% means frog will take up 95% of icon size (less padding)
const scaleFactor = 0.95;

sizes.forEach(size => {
  const outputPath = path.join(iconsDir, `icon-${size}.png`);
  
  // Calculate scaled size for the frog (95% of target size)
  const frogSize = Math.round(size * scaleFactor);
  
  // Use ImageMagick to:
  // 1. Auto-trim empty space around the frog
  // 2. Resize the cropped frog to frogSize x frogSize
  // 3. Create a transparent square of target size
  // 4. Center the frog on the square
  const cmd = `magick "${sourceImage}" -trim -resize ${frogSize}x${frogSize} -background transparent -gravity center -extent ${size}x${size} "${outputPath}"`;

  try {
    execSync(cmd);
    console.log(`✓ Created icon-${size}.png (${size}x${size}, frog fills ~${Math.round(scaleFactor * 100)}%)`);
  } catch (err) {
    console.error(`❌ Failed to create icon-${size}.png: ${err.message}`);
  }
});

console.log('');
console.log('✅ PNG icons created successfully in the icons/ folder.');
console.log('Next step (optional): npm run sync to copy icons into the Xcode extension resources.');
console.log('');


