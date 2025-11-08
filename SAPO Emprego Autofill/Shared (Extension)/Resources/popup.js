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
    const photoFile = formData.get('photo');
    const cvFile = formData.get('cv');
    
    if (!name || !email || !phone) {
        showStatus('Please fill in all text fields', 'error');
        return;
    }
    
    try {
        showStatus('Saving data...', 'info');
        
        const data = {
            formData: { name, email, phone }
        };
        
        // Only save files if they're selected
        if (photoFile && photoFile.size > 0) {
            const photoBase64 = await convertFileToBase64(photoFile);
            data.fileData = data.fileData || {};
            data.fileData.photo = {
                name: photoFile.name,
                type: photoFile.type || 'image/png',
                base64: photoBase64
            };
        }
        
        if (cvFile && cvFile.size > 0) {
            const cvBase64 = await convertFileToBase64(cvFile);
            data.fileData = data.fileData || {};
            data.fileData.cv = {
                name: cvFile.name,
                type: cvFile.type || 'application/pdf',
                base64: cvBase64
            };
        }
        
        // Save to browser storage
        if (typeof browser !== 'undefined' && browser.storage) {
            await browser.storage.local.set(data);
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set(data);
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

