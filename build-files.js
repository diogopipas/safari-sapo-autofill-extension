#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read and convert files to base64
const photoPath = path.join(__dirname, 'assets', 'photo.png');
const cvPath = path.join(__dirname, 'assets', 'CV.pdf');

// Check if files exist
if (!fs.existsSync(photoPath)) {
  console.error('❌ Error: assets/photo.png not found!');
  console.error('   Please add your photo to the assets/ folder.');
  process.exit(1);
}

if (!fs.existsSync(cvPath)) {
  console.error('❌ Error: assets/CV.pdf not found!');
  console.error('   Please add your CV to the assets/ folder.');
  process.exit(1);
}

const photoBase64 = fs.readFileSync(photoPath).toString('base64');
const cvBase64 = fs.readFileSync(cvPath).toString('base64');

// Generate fileData.js
const fileDataContent = `// Auto-generated file data - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

const FILE_DATA = {
  photo: {
    name: 'photo.png',
    type: 'image/png',
    base64: '${photoBase64}'
  },
  cv: {
    name: 'CV.pdf',
    type: 'application/pdf',
    base64: '${cvBase64}'
  }
};

// Helper function to convert base64 to File object
function base64ToFile(base64Data, filename, mimeType) {
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create blob and file
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

// Make available to content script
if (typeof window !== 'undefined') {
  window.FILE_DATA = FILE_DATA;
  window.base64ToFile = base64ToFile;
}
`;

// Write fileData.js
const outputPath = path.join(__dirname, 'fileData.js');
fs.writeFileSync(outputPath, fileDataContent);

console.log('✓ Generated fileData.js successfully!');
console.log(`  - Photo size: ${Math.round(photoBase64.length / 1024)} KB (base64)`);
console.log(`  - CV size: ${Math.round(cvBase64.length / 1024)} KB (base64)`);

