// Content script for SAPO Emprego Autofill Extension

console.log('SAPO Autofill Extension loaded');

// Personal information to fill
const FORM_DATA = {
  name: 'Diogo Guerreiro Porto',
  email: 'diogo.g.portob@gmail.com',
  phone: '933949061'
};

// Listen for autofill trigger from background script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'SAPO_AUTOFILL_TRIGGER') {
    performAutofill();
  }
});

async function performAutofill() {
  console.log('Starting autofill process...');
  
  try {
    // Step 1: Fill text fields
    fillTextField('name', FORM_DATA.name);
    fillTextField('email', FORM_DATA.email);
    fillTextField('phone', FORM_DATA.phone);
    
    // Wait a bit for the page to process
    await sleep(300);
    
    // Step 2: Upload photo
    await uploadFile('photo', FILE_DATA.photo);
    
    // Wait a bit between uploads
    await sleep(300);
    
    // Step 3: Upload CV
    await uploadFile('cv', FILE_DATA.cv);
    
    // Wait a bit for uploads to process
    await sleep(300);
    
    // Step 4: Check terms and conditions
    checkTermsCheckbox();
    
    // Wait a bit before submitting
    await sleep(500);
    
    // Step 5: Submit the form
    submitForm();
    
    console.log('Autofill completed successfully!');
    showNotification('Form filled successfully!', 'success');
  } catch (error) {
    console.error('Autofill error:', error);
    showNotification('Error filling form: ' + error.message, 'error');
  }
}

function fillTextField(fieldType, value) {
  let input = null;
  
  // Try multiple strategies to find the field
  if (fieldType === 'name') {
    // Look for input with label "Nome"
    input = findInputByLabel('Nome') || 
            document.querySelector('input[name*="nome"]') ||
            document.querySelector('input[id*="nome"]') ||
            document.querySelector('input[placeholder*="Nome"]');
  } else if (fieldType === 'email') {
    // Look for email input
    input = findInputByLabel('Email') ||
            document.querySelector('input[type="email"]') ||
            document.querySelector('input[name*="email"]') ||
            document.querySelector('input[id*="email"]');
  } else if (fieldType === 'phone') {
    // Look for phone input
    input = findInputByLabel('Contacto telefónico') ||
            findInputByLabel('Contacto') ||
            document.querySelector('input[type="tel"]') ||
            document.querySelector('input[name*="telefone"]') ||
            document.querySelector('input[name*="phone"]') ||
            document.querySelector('input[id*="telefone"]') ||
            document.querySelector('input[id*="phone"]');
  }
  
  if (input) {
    // Set the value
    input.value = value;
    
    // Trigger events so the form recognizes the change
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    
    console.log(`✓ Filled ${fieldType} field`);
  } else {
    console.warn(`✗ Could not find ${fieldType} field`);
  }
}

function findInputByLabel(labelText) {
  // Find label containing the text
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(l => l.textContent.trim().includes(labelText));
  
  if (label) {
    // Try to find associated input
    if (label.htmlFor) {
      return document.getElementById(label.htmlFor);
    }
    // Look for input within or after the label
    return label.querySelector('input') || 
           label.nextElementSibling?.querySelector('input') ||
           label.parentElement?.querySelector('input');
  }
  
  return null;
}

async function uploadFile(fileType, fileData) {
  let fileInput = null;
  
  // Find the file input
  if (fileType === 'photo') {
    fileInput = findFileInputByLabel('Foto') ||
                document.querySelector('input[type="file"][accept*="image"]') ||
                document.querySelector('input[type="file"][name*="foto"]') ||
                document.querySelector('input[type="file"][id*="foto"]');
  } else if (fileType === 'cv') {
    fileInput = findFileInputByLabel('CV') ||
                document.querySelector('input[type="file"][accept*="pdf"]') ||
                document.querySelector('input[type="file"][name*="cv"]') ||
                document.querySelector('input[type="file"][id*="cv"]') ||
                document.querySelector('input[type="file"][name*="curriculum"]');
  }
  
  if (!fileInput) {
    console.warn(`✗ Could not find ${fileType} file input`);
    return;
  }
  
  try {
    // Convert base64 to File object
    const file = base64ToFile(fileData.base64, fileData.name, fileData.type);
    
    // Create a DataTransfer object to set files
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Set the files on the input
    fileInput.files = dataTransfer.files;
    
    // Trigger events
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log(`✓ Uploaded ${fileType} file: ${fileData.name}`);
  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
  }
}

function findFileInputByLabel(labelText) {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find(l => l.textContent.trim().includes(labelText));
  
  if (label) {
    if (label.htmlFor) {
      return document.getElementById(label.htmlFor);
    }
    return label.querySelector('input[type="file"]') || 
           label.nextElementSibling?.querySelector('input[type="file"]') ||
           label.parentElement?.querySelector('input[type="file"]');
  }
  
  return null;
}

function checkTermsCheckbox() {
  // Find terms checkbox by various methods
  const checkbox = document.querySelector('input[type="checkbox"]') ||
                   findCheckboxByText('Termos e Condições') ||
                   findCheckboxByText('aceito');
  
  if (checkbox && !checkbox.checked) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    checkbox.dispatchEvent(new Event('click', { bubbles: true }));
    console.log('✓ Checked terms and conditions');
  } else if (checkbox && checkbox.checked) {
    console.log('✓ Terms already checked');
  } else {
    console.warn('✗ Could not find terms checkbox');
  }
}

function findCheckboxByText(text) {
  // Find checkbox near text containing the search term
  const elements = Array.from(document.querySelectorAll('*'));
  const element = elements.find(el => 
    el.textContent.includes(text) && 
    el.querySelector('input[type="checkbox"]')
  );
  
  return element?.querySelector('input[type="checkbox"]');
}

function submitForm() {
  // Find submit button
  const submitButton = findButtonByText('ENVIAR CANDIDATURA') ||
                       findButtonByText('ENVIAR') ||
                       document.querySelector('button[type="submit"]') ||
                       document.querySelector('input[type="submit"]');
  
  if (submitButton) {
    console.log('✓ Found submit button - clicking...');
    submitButton.click();
    
    // Also show notification
    setTimeout(() => {
      showNotification('Form submitted! Please verify the submission.', 'success');
    }, 1000);
  } else {
    console.warn('✗ Could not find submit button');
    showNotification('Form filled but submit button not found. Please submit manually.', 'warning');
  }
}

function findButtonByText(text) {
  const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"]'));
  return buttons.find(btn => 
    btn.textContent.trim().includes(text) || 
    btn.value?.includes(text)
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showNotification(message, type = 'info') {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

