// Example file data structure
// Run 'node build-files.js' to generate fileData.js with your actual files

const FILE_DATA = {
  photo: {
    name: 'photo.png',
    type: 'image/png',
    base64: '' // Your photo will be embedded here as base64
  },
  cv: {
    name: 'CV.pdf',
    type: 'application/pdf',
    base64: '' // Your CV will be embedded here as base64
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

