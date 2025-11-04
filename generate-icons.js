#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple SVG icon for the extension (a form with a checkmark)
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#0066CC"/>
  
  <!-- Document/Form icon -->
  <rect x="${size * 0.2}" y="${size * 0.15}" width="${size * 0.6}" height="${size * 0.7}" 
        fill="white" rx="${size * 0.05}"/>
  
  <!-- Lines representing form fields -->
  <rect x="${size * 0.3}" y="${size * 0.28}" width="${size * 0.4}" height="${size * 0.05}" 
        fill="#0066CC" rx="${size * 0.025}"/>
  <rect x="${size * 0.3}" y="${size * 0.42}" width="${size * 0.4}" height="${size * 0.05}" 
        fill="#0066CC" rx="${size * 0.025}"/>
  <rect x="${size * 0.3}" y="${size * 0.56}" width="${size * 0.4}" height="${size * 0.05}" 
        fill="#0066CC" rx="${size * 0.025}"/>
  
  <!-- Checkmark -->
  <circle cx="${size * 0.75}" cy="${size * 0.75}" r="${size * 0.15}" fill="#4CAF50"/>
  <path d="M ${size * 0.68} ${size * 0.75} L ${size * 0.73} ${size * 0.80} L ${size * 0.82} ${size * 0.68}" 
        stroke="white" stroke-width="${size * 0.04}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Create SVG files for all sizes needed by Xcode
const sizes = [16, 32, 48, 64, 96, 128, 256, 512, 1024];

sizes.forEach(size => {
  const svg = createSVG(size);
  const svgPath = path.join(__dirname, 'icons', `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`✓ Created icon-${size}.svg`);
});

console.log('\nSVG icons created successfully!');
console.log('Note: Safari supports SVG icons, but if you need PNG, you can convert them using:');
console.log('  - Online tools like CloudConvert');
console.log('  - ImageMagick: convert icon-48.svg icon-48.png');
console.log('  - Or use macOS Preview app to export as PNG');

