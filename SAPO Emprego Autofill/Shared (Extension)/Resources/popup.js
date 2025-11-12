// Helper function to show status messages
function showStatus(message, type = 'info') {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 3000);
    }
}

// Helper function to convert file to base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Save form data to storage
async function saveFormData() {
    const form = document.getElementById('autofillForm');
    const formData = new FormData(form);
    
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    
    // Check file inputs directly to see if new files were selected
    const photoInput = document.getElementById('photo');
    const cvInput = document.getElementById('cv');
    const photoFile = photoInput.files && photoInput.files.length > 0 ? photoInput.files[0] : null;
    const cvFile = cvInput.files && cvInput.files.length > 0 ? cvInput.files[0] : null;
    
    if (!name || !email || !phone) {
        showStatus('Please fill in all text fields', 'error');
        return;
    }
    
    try {
        showStatus('Saving data...', 'info');
        
        // Load existing data first to preserve existing files
        let existingData = {};
        if (typeof browser !== 'undefined' && browser.storage) {
            existingData = await browser.storage.local.get(['formData', 'fileData']);
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
            existingData = await new Promise((resolve) => {
                chrome.storage.local.get(['formData', 'fileData'], resolve);
            });
        }
        
        console.log('Existing data loaded:', existingData);
        console.log('Existing fileData:', existingData.fileData);
        console.log('Existing fileData keys:', existingData.fileData ? Object.keys(existingData.fileData) : 'none');
        
        // Start with existing fileData - copy the entire object to preserve all files
        const fileData = existingData.fileData ? JSON.parse(JSON.stringify(existingData.fileData)) : {};
        
        console.log('Copied fileData before updates:', Object.keys(fileData));
        console.log('Has existing photo:', !!fileData.photo);
        console.log('Has existing CV:', !!fileData.cv);
        
        // Only update files if new ones are selected (preserve existing ones if not)
        if (photoFile && photoFile.size > 0) {
            console.log('Updating photo:', photoFile.name);
            const photoBase64 = await convertFileToBase64(photoFile);
            fileData.photo = {
                name: photoFile.name,
                type: photoFile.type || 'image/png',
                base64: photoBase64
            };
        } else {
            console.log('No new photo selected, keeping existing photo:', !!fileData.photo);
        }
        
        if (cvFile && cvFile.size > 0) {
            console.log('Updating CV:', cvFile.name);
            const cvBase64 = await convertFileToBase64(cvFile);
            fileData.cv = {
                name: cvFile.name,
                type: cvFile.type || 'application/pdf',
                base64: cvBase64
            };
        } else {
            console.log('No new CV selected, keeping existing CV:', !!fileData.cv);
        }
        
        console.log('Final fileData keys:', Object.keys(fileData));
        console.log('Final fileData.photo exists:', !!fileData.photo);
        console.log('Final fileData.cv exists:', !!fileData.cv);
        
        const data = {
            formData: { name, email, phone },
            fileData: fileData
        };
        
        // Save to browser storage - explicitly set both keys to ensure we preserve everything
        if (typeof browser !== 'undefined' && browser.storage) {
            // For Firefox, set each key separately to ensure proper merging
            await browser.storage.local.set({
                formData: data.formData,
                fileData: data.fileData
            });
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
            await new Promise((resolve, reject) => {
                // Explicitly set both keys to ensure we preserve everything
                chrome.storage.local.set({
                    formData: data.formData,
                    fileData: data.fileData
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error('Storage error:', chrome.runtime.lastError);
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        console.log('Data saved successfully to storage');
                        resolve();
                    }
                });
            });
        }
        
        showStatus('Data saved successfully!', 'success');
        
        // Close popup after a short delay
        setTimeout(() => {
            window.close();
        }, 1500);
    } catch (error) {
        console.error('Error saving data:', error);
        showStatus('Error saving data: ' + error.message, 'error');
    }
}

// Load saved data from storage
async function loadSavedData() {
    try {
        let data;
        if (typeof browser !== 'undefined' && browser.storage) {
            data = await browser.storage.local.get(['formData', 'fileData']);
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
            data = await new Promise((resolve) => {
                chrome.storage.local.get(['formData', 'fileData'], resolve);
            });
        }
        
        if (data && data.formData) {
            document.getElementById('name').value = data.formData.name || '';
            document.getElementById('email').value = data.formData.email || '';
            document.getElementById('phone').value = data.formData.phone || '';
        }
        
        // Update file displays if files are already saved
        if (data && data.fileData) {
            const photoDisplay = document.getElementById('photoFileName');
            const cvDisplay = document.getElementById('cvFileName');
            
            if (data.fileData.photo) {
                photoDisplay.textContent = data.fileData.photo.name + ' (saved)';
                photoDisplay.classList.add('has-file');
            }
            
            if (data.fileData.cv) {
                cvDisplay.textContent = data.fileData.cv.name + ' (saved)';
                cvDisplay.classList.add('has-file');
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Update file name display when file is selected
function updateFileName(inputId, displayId) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            display.textContent = file.name;
            display.classList.add('has-file');
        } else {
            display.textContent = 'No file selected';
            display.classList.remove('has-file');
        }
    });
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    // Load saved data on startup
    loadSavedData();
    
    // Set up event listeners
    document.getElementById('saveButton').addEventListener('click', saveFormData);
    
    // Set up file input listeners
    updateFileName('photo', 'photoFileName');
    updateFileName('cv', 'cvFileName');
});

