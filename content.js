// Content script for SAPO Emprego Autofill Extension

// Prevent multiple initializations - wrap everything in an IIFE
(function() {
  'use strict';
  
  // Check if already initialized
  if (window.__SAPO_AUTOFILL_INITIALIZED__) {
    console.log('SAPO Autofill Extension already initialized, skipping duplicate initialization...');
    return; // Exit early to prevent duplicate variable declarations
  }
  
  // Mark as initialized
  window.__SAPO_AUTOFILL_INITIALIZED__ = true;
  
  console.log('SAPO Autofill Extension loaded');

  // Personal information to fill - loaded from userData.js
  // Create userData.js from userData.example.js with your information
  if (typeof FORM_DATA === 'undefined') {
    console.error('❌ FORM_DATA not loaded! Please create userData.js from userData.example.js');
    window.FORM_DATA = {
      name: '',
      email: '',
      phone: ''
    };
  }

  // Click detection for single vs double click - use window scope to avoid conflicts
  window.__SAPO_AUTOFILL_CLICK_TIMER__ = null;
  window.__SAPO_AUTOFILL_IS_DOUBLE_CLICK__ = false;
  window.__SAPO_AUTOFILL_LAST_CLICK_TIME__ = 0;
  window.__SAPO_AUTOFILL_DOUBLE_CLICK_DELAY__ = 300; // ms

// Add click listener to detect form interactions
function initializeClickListener() {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFormClickListener);
  } else {
    setupFormClickListener();
  }
}

function setupFormClickListener() {
  console.log('Setting up click listeners...');
  
  // Find the form container
  const formSelectors = [
    'form',
    '[class*="form"]',
    '[id*="form"]',
    '[class*="candidatura"]'
  ];
  
  let formElement = null;
  for (const selector of formSelectors) {
    formElement = document.querySelector(selector);
    if (formElement) {
      console.log('✓ Found form element:', formElement);
      console.log('  Tag:', formElement.tagName, 'Class:', formElement.className);
      break;
    }
  }
  
  if (!formElement) {
    console.log('⚠ No form found, attaching to document body');
    formElement = document.body;
  }
  
  // Add both click and double-click listeners (using capture phase)
  formElement.addEventListener('click', handleFormClick, true);
  formElement.addEventListener('dblclick', handleFormDoubleClick, true);
  
  console.log('✓ Click listeners attached successfully to:', formElement.tagName);
  console.log('  Try clicking anywhere on the form to test!');
  
  // Add a test listener to verify events are firing
  formElement.addEventListener('click', function testClick(e) {
    console.log('🔵 RAW CLICK EVENT detected on:', e.target.tagName, e.target);
  }, true);
  
  formElement.addEventListener('dblclick', function testDblClick(e) {
    console.log('🔵 RAW DBLCLICK EVENT detected on:', e.target.tagName, e.target);
  }, true);
}

function shouldIgnoreClick(target) {
  // Check if click is on an interactive element
  try {
    if (!target || !target.matches) {
      console.log('Target has no matches function');
      return false;
    }
    
    // Only ignore actual interactive elements, not their labels
    const isInteractive = target.matches('button, a, input, textarea, select');
    console.log('isInteractive:', isInteractive, 'for', target.tagName);
    return isInteractive;
  } catch (e) {
    console.warn('Error checking click target:', e);
    return false;
  }
}

async function handleFormClick(event) {
  console.log('handleFormClick triggered', event.target);
  
  // Ignore clicks on interactive elements
  if (shouldIgnoreClick(event.target)) {
    console.log('Click ignored - interactive element:', event.target.tagName);
    return;
  }
  
  console.log('Click accepted - processing...');
  
  // If this was part of a double-click, skip single-click action
  if (window.__SAPO_AUTOFILL_IS_DOUBLE_CLICK__) {
    console.log('Part of double-click, skipping single-click action');
    window.__SAPO_AUTOFILL_IS_DOUBLE_CLICK__ = false;
    return;
  }
  
  // Check timing to detect rapid double-click
  const currentTime = Date.now();
  const timeSinceLastClick = currentTime - (window.__SAPO_AUTOFILL_LAST_CLICK_TIME__ || 0);
  window.__SAPO_AUTOFILL_LAST_CLICK_TIME__ = currentTime;
  
  // If this is a rapid second click, don't set a new timer
  // The dblclick event will handle it
  if (timeSinceLastClick < window.__SAPO_AUTOFILL_DOUBLE_CLICK_DELAY__) {
    console.log('Rapid second click detected - waiting for dblclick event');
    // Clear the existing timer but don't set a new one
    if (window.__SAPO_AUTOFILL_CLICK_TIMER__) {
      clearTimeout(window.__SAPO_AUTOFILL_CLICK_TIMER__);
      window.__SAPO_AUTOFILL_CLICK_TIMER__ = null;
    }
    return;
  }
  
  // Clear any existing timer
  if (window.__SAPO_AUTOFILL_CLICK_TIMER__) {
    clearTimeout(window.__SAPO_AUTOFILL_CLICK_TIMER__);
  }
  
  // Wait to see if a double-click follows
  window.__SAPO_AUTOFILL_CLICK_TIMER__ = setTimeout(async () => {
    console.log('✓ Single click detected - autofilling...');
    await handleSingleClick();
    window.__SAPO_AUTOFILL_CLICK_TIMER__ = null;
  }, window.__SAPO_AUTOFILL_DOUBLE_CLICK_DELAY__);
}

function handleFormDoubleClick(event) {
  console.log('handleFormDoubleClick triggered', event.target);
  
  // Ignore clicks on interactive elements
  if (shouldIgnoreClick(event.target)) {
    console.log('Double-click ignored - interactive element:', event.target.tagName);
    return;
  }
  
  console.log('Double-click accepted - processing...');
  
  // Set flag to prevent single-click action
  window.__SAPO_AUTOFILL_IS_DOUBLE_CLICK__ = true;
  
  // Clear the single-click timer
  if (window.__SAPO_AUTOFILL_CLICK_TIMER__) {
    clearTimeout(window.__SAPO_AUTOFILL_CLICK_TIMER__);
    window.__SAPO_AUTOFILL_CLICK_TIMER__ = null;
  }
  
  console.log('✓ Double-click detected - opening popup...');
  handleDoubleClick();
  
  // Reset the flag after a delay
  setTimeout(() => {
    window.__SAPO_AUTOFILL_IS_DOUBLE_CLICK__ = false;
  }, window.__SAPO_AUTOFILL_DOUBLE_CLICK_DELAY__);
}

async function handleSingleClick() {
  try {
    console.log('Loading saved data from storage...');
    
    // Load saved data from storage
    let data;
    if (typeof browser !== 'undefined' && browser.storage) {
      console.log('Using Firefox browser.storage API');
      data = await browser.storage.local.get(['formData', 'fileData']);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      console.log('Using Chrome chrome.storage API');
      data = await new Promise((resolve) => {
        chrome.storage.local.get(['formData', 'fileData'], resolve);
      });
    } else {
      console.error('No storage API available');
      showNotification('Storage API not available. Please check extension permissions.', 'error');
      return;
    }
    
    console.log('Storage data retrieved:', { 
      hasFormData: !!data?.formData, 
      hasFileData: !!data?.fileData 
    });
    
    if (data && data.formData && data.fileData) {
      console.log('✓ Found saved data, starting autofill...');
      await performAutofillWithData(data);
    } else {
      console.log('⚠ No saved data found');
      showNotification('No saved data found. Double-click to open settings and save your data.', 'warning');
    }
  } catch (error) {
    console.error('❌ Error loading saved data:', error);
    showNotification('Error loading saved data: ' + error.message, 'error');
  }
}

function handleDoubleClick() {
  console.log('Attempting to open popup...');
  
  // Send message to background to open popup
  try {
    if (typeof browser !== 'undefined' && browser.runtime) {
      console.log('Sending message via browser.runtime');
      browser.runtime.sendMessage({ action: 'openPopup' }).catch(err => {
        console.error('Error sending message:', err);
      });
    } else if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.log('Sending message via chrome.runtime');
      chrome.runtime.sendMessage({ action: 'openPopup' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
        }
      });
    } else {
      console.error('No runtime API available');
    }
    
    showNotification('Double-click detected! Please click the extension icon to edit your data.', 'info');
  } catch (error) {
    console.error('Error in handleDoubleClick:', error);
    showNotification('Please click the extension icon to edit your data.', 'info');
  }
}

// Initialize click listener
initializeClickListener();

// Listen for messages from popup and background script
if (typeof browser !== 'undefined' && browser.runtime) {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillForm') {
      performAutofillWithData(message.data);
      sendResponse({ success: true });
    } else if (message.action === 'showPopupOverlay') {
      showPopupOverlay();
      sendResponse({ success: true });
    }
  });
} else if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'fillForm') {
      performAutofillWithData(message.data);
      sendResponse({ success: true });
    } else if (message.action === 'showPopupOverlay') {
      showPopupOverlay();
      sendResponse({ success: true });
    }
  });
}

// Listen for autofill trigger from background script
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'SAPO_AUTOFILL_TRIGGER') {
    performAutofill();
  }
});

// Autofill with data from popup
async function performAutofillWithData(data) {
  console.log('Starting autofill with popup data...');
  
  try {
    // Step 1: Fill text fields
    fillTextField('name', data.formData.name);
    fillTextField('email', data.formData.email);
    fillTextField('phone', data.formData.phone);
    
    // Wait a bit for the page to process
    await sleep(300);
    
    // Step 2: Upload photo
    await uploadFileFromData('photo', data.fileData.photo);
    
    // Wait a bit between uploads
    await sleep(300);
    
    // Step 3: Upload CV
    await uploadFileFromData('cv', data.fileData.cv);
    
    // Wait a bit for uploads to process
    await sleep(300);
    
    // Step 4: Check terms and conditions
    checkTermsCheckbox();
    
    // Wait a bit before submit
    await sleep(500);
    
    // Step 5: Submit the form
    submitForm();
    
    console.log('✅ Autofill complete!');
    showNotification('Form filled successfully! Please verify before submitting.');
  } catch (error) {
    console.error('❌ Error during autofill:', error);
    showNotification('Error during autofill. Please check the console for details.', true);
  }
}

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

// Helper function to convert base64 to File (for popup data)
function base64ToFileFromPopup(base64Data, filename, mimeType) {
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

// Upload file with data from popup
async function uploadFileFromData(fileType, fileData) {
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
    const file = base64ToFileFromPopup(fileData.base64, fileData.name, fileData.type);
    
    // Create a DataTransfer object to set files
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Set the files on the input
    fileInput.files = dataTransfer.files;
    
    // Trigger events
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log(`✓ Uploaded ${fileType} file: ${fileData.name}`);
    
    // If this is a photo upload, wait for and handle the OK button in the popup
    if (fileType === 'photo') {
      await waitAndClickOKButton();
    }
  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
  }
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
    
    // If this is a photo upload, wait for and handle the OK button in the popup
    if (fileType === 'photo') {
      await waitAndClickOKButton();
    }
  } catch (error) {
    console.error(`Error uploading ${fileType}:`, error);
  }
}

async function waitAndClickOKButton() {
  console.log('Waiting for photo upload popup OK button...');
  
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 100; // 100 attempts * 100ms = 10 seconds
    let observer = null;
    let okButtonFoundTime = null;
    const waitAfterButtonFound = 100; // Wait 0.1 seconds after finding button for cropper to load
    
    // Function to search for and click the OK button
    const searchAndClick = () => {
      // Look for all buttons on the page
      const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]');
      
      // Log all buttons for debugging (only on first attempt)
      if (attempts === 0 && allButtons.length > 0) {
        console.log(`Found ${allButtons.length} buttons on page`);
      }
      
      // Look for OK button - try exact text match first
      let okButton = null;
      
      // Strategy 1: Find button with text exactly "OK" (case insensitive)
      for (const button of allButtons) {
        const text = button.textContent?.trim().toUpperCase();
        if (text === 'OK') {
          okButton = button;
          if (!okButtonFoundTime) {
            okButtonFoundTime = Date.now();
            console.log('Found OK button - waiting for cropper to load before clicking...');
          }
          break;
        }
      }
      
      // Strategy 2: Try other selectors if not found
      if (!okButton) {
        okButton = findButtonByText('OK') ||
                   findButtonByText('ok') ||
                   // Look for buttons in modal/popup/dialog containers
                   document.querySelector('[role="dialog"] button:not([class*="cancel"]):not([class*="cancelar"])') ||
                   document.querySelector('.modal button:not([class*="cancel"]):not([class*="cancelar"])') ||
                   document.querySelector('.popup button:not([class*="cancel"]):not([class*="cancelar"])') ||
                   // Look for primary/confirm buttons
                   document.querySelector('button[class*="primary"]') ||
                   document.querySelector('button[class*="confirm"]') ||
                   document.querySelector('button[class*="accept"]') ||
                   // Try finding the rightmost button in a dialog (OK is usually on the right)
                   Array.from(document.querySelectorAll('[role="dialog"] button, .modal button, .popup button'))
                     .filter(btn => !btn.textContent?.includes('CANCELAR'))
                     .pop();
        
        if (okButton && !okButtonFoundTime) {
          okButtonFoundTime = Date.now();
          console.log('Found OK button (via fallback) - waiting for cropper to load before clicking...');
        }
      }
      
      // If we found the button and enough time has passed, click it
      if (okButton && okButtonFoundTime) {
        const timeSinceFound = Date.now() - okButtonFoundTime;
        
        if (timeSinceFound >= waitAfterButtonFound) {
          console.log('✓ Cropper should be ready - clicking OK button now...', okButton);
          
          // Stop the observer if it's running
          if (observer) {
            observer.disconnect();
          }
          
          // Try multiple click methods to ensure it works
          okButton.click();
          okButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          okButton.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          okButton.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          
          // Wait a moment for the click to process
          setTimeout(() => resolve(), 500);
          return true;
        } else {
          // Still waiting
          const remainingWait = ((waitAfterButtonFound - timeSinceFound) / 1000).toFixed(1);
          if (Math.floor(timeSinceFound / 500) !== Math.floor((timeSinceFound - 100) / 500)) {
            console.log(`Waiting ${remainingWait}s more for cropper...`);
          }
        }
      }
      
      return false;
    };
    
    // Set up MutationObserver to watch for popup appearing
    observer = new MutationObserver((mutations) => {
      if (searchAndClick()) {
        observer.disconnect();
      }
    });
    
    // Start observing the document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    // Also poll regularly as a backup
    const intervalId = setInterval(() => {
      attempts++;
      
      if (searchAndClick()) {
        clearInterval(intervalId);
        observer.disconnect();
        return;
      }
      
      // Log progress every second (only if we haven't found the button yet)
      if (attempts % 10 === 0 && !okButtonFoundTime) {
        console.log(`Still waiting for OK button... (${attempts / 10}s elapsed)`);
      }
      
      // Timeout after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
        observer.disconnect();
        console.warn('⚠ OK button not found after 10 seconds - popup may not have appeared or has different structure');
        console.log('All buttons on page:', Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.textContent?.trim(),
          classes: b.className,
          id: b.id
        })));
        resolve();
      }
    }, 100);
    
    // Do an immediate check
    searchAndClick();
  });
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
  console.log('Looking for terms and conditions checkbox...');
  
  // Try multiple strategies to find the checkbox
  let checkbox = findCheckboxByText('Termos e Condições') ||
                 findCheckboxByText('aceito') ||
                 findCheckboxByText('autorizo') ||
                 document.querySelector('input[type="checkbox"][name*="termos"]') ||
                 document.querySelector('input[type="checkbox"][id*="termos"]') ||
                 document.querySelector('input[type="checkbox"]');
  
  if (checkbox) {
    console.log('Checkbox element found:', checkbox);
    console.log('Checkbox ID:', checkbox.id, 'Name:', checkbox.name, 'Checked:', checkbox.checked);
    console.log('Checkbox visible:', checkbox.offsetParent !== null);
    
    // Check if the checkbox is hidden (common with custom checkboxes)
    const isHidden = checkbox.offsetParent === null;
    
    if (isHidden) {
      console.log('⚠ Checkbox is hidden - looking for visible custom checkbox element...');
      
      // Find visible clickable elements near the hidden checkbox
      // Custom checkboxes are usually siblings or in the parent/label
      const parent = checkbox.parentElement;
      const label = document.querySelector(`label[for="${checkbox.id}"]`) || checkbox.closest('label');
      
      console.log('Parent element:', parent);
      console.log('Associated label:', label);
      
      // Look for visible clickable elements
      let clickableElement = null;
      
      // Strategy 1: Look for siblings of the hidden checkbox
      if (parent) {
        const siblings = Array.from(parent.children).filter(el => el !== checkbox);
        console.log('Siblings:', siblings);
        
        for (const sibling of siblings) {
          if (sibling.offsetParent !== null) { // is visible
            clickableElement = sibling;
            console.log('Found visible sibling to click:', sibling);
            break;
          }
        }
      }
      
      // Strategy 2: Click the label
      if (!clickableElement && label && label.offsetParent !== null) {
        clickableElement = label;
        console.log('Using label as clickable element');
      }
      
      // Strategy 3: Click the parent
      if (!clickableElement && parent && parent.offsetParent !== null) {
        clickableElement = parent;
        console.log('Using parent as clickable element');
      }
      
      // If we found a visible element, click it
      if (clickableElement) {
        console.log('Clicking visible element:', clickableElement);
        
        // First, set focus on the checkbox/element
        try {
          checkbox.focus();
        } catch (e) {
          // Focus might fail on hidden elements, that's ok
        }
        
        // Try to click and dispatch comprehensive events to trigger ANY framework
        
        // Dispatch pointer/mouse events first (for modern frameworks)
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(eventType => {
          clickableElement.dispatchEvent(new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1
          }));
        });
        
        // Also click the element directly
        clickableElement.click();
        
        // Try clicking the label if we have it
        if (label && label !== clickableElement) {
          label.click();
          ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(eventType => {
            label.dispatchEvent(new MouseEvent(eventType, {
              bubbles: true,
              cancelable: true,
              view: window,
              detail: 1
            }));
          });
        }
        
        // Force the checkbox state and dispatch all relevant events
        checkbox.checked = true;
        ['change', 'input', 'click'].forEach(eventType => {
          checkbox.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        
        // Dispatch focus events
        ['focus', 'focusin'].forEach(eventType => {
          checkbox.dispatchEvent(new FocusEvent(eventType, { bubbles: true }));
        });
        
        // Check if it worked
        setTimeout(() => {
          if (checkbox.checked) {
            console.log('✓ Checkbox is NOW checked via visible element!');
          } else {
            console.warn('✗ Checkbox still not checked after all attempts');
            console.log('Checkbox state:', {
              checked: checkbox.checked,
              disabled: checkbox.disabled,
              value: checkbox.value,
              computed_style: window.getComputedStyle(checkbox).display
            });
          }
        }, 100);
      } else {
        console.warn('Could not find visible element to click');
        // Try clicking everything we can find
        if (label) {
          label.click();
          // Dispatch comprehensive events on label
          ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(eventType => {
            label.dispatchEvent(new MouseEvent(eventType, {
              bubbles: true,
              cancelable: true,
              view: window
            }));
          });
        }
        if (parent) {
          parent.click();
        }
        
        // Force checkbox state
        checkbox.checked = true;
        ['change', 'input', 'click'].forEach(eventType => {
          checkbox.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
      }
      
    } else {
      // Checkbox is visible, use direct methods
      console.log('Checkbox is visible - clicking directly');
      
      // First try focusing
      try {
        checkbox.focus();
      } catch (e) {
        console.log('Could not focus checkbox:', e);
      }
      
      // Dispatch pointer events first
      ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach(eventType => {
        checkbox.dispatchEvent(new MouseEvent(eventType, {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      });
      
      // Click it
      checkbox.click();
      
      // Set checked state
      checkbox.checked = true;
      
      // Dispatch state change events
      ['change', 'input', 'click'].forEach(eventType => {
        checkbox.dispatchEvent(new Event(eventType, { bubbles: true }));
      });
      
      setTimeout(() => {
        console.log('Checkbox checked:', checkbox.checked);
        if (!checkbox.checked) {
          console.warn('Checkbox visible but still not checked!');
        }
      }, 100);
    }
    
  } else {
    console.warn('✗ Could not find terms checkbox');
  }
}

function findCheckboxByText(text) {
  // Strategy: Find checkbox that's specifically associated with the text
  // We need to be more careful to avoid finding checkboxes that just happen to be
  // in a container that has the text somewhere
  
  const allElements = Array.from(document.querySelectorAll('*'));
  
  for (const element of allElements) {
    // Skip if element doesn't contain the text
    if (!element.textContent.includes(text)) continue;
    
    // Skip if the element is too large (likely a container)
    const directText = Array.from(element.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent.trim())
      .join(' ');
    
    // Only consider if this element itself (not just descendants) contains the text
    if (!directText.includes(text)) continue;
    
    console.log(`Element with direct text "${text}":`, element, 'Text:', directText);
    
    // Look for checkbox within this specific element (not descendants)
    const directCheckbox = Array.from(element.children).find(
      child => child.tagName === 'INPUT' && child.type === 'checkbox'
    );
    if (directCheckbox) {
      console.log(`Found checkbox as direct child of element with text: "${text}"`);
      return directCheckbox;
    }
    
    // Look for checkbox as previous sibling
    const prevSibling = element.previousElementSibling;
    if (prevSibling && prevSibling.tagName === 'INPUT' && prevSibling.type === 'checkbox') {
      console.log(`Found checkbox as previous sibling of text: "${text}"`);
      return prevSibling;
    }
    
    // Look for checkbox as next sibling
    const nextSibling = element.nextElementSibling;
    if (nextSibling && nextSibling.tagName === 'INPUT' && nextSibling.type === 'checkbox') {
      console.log(`Found checkbox as next sibling of text: "${text}"`);
      return nextSibling;
    }
    
    // Look in parent's direct children (siblings)
    if (element.parentElement) {
      const parentCheckbox = Array.from(element.parentElement.children).find(
        child => child.tagName === 'INPUT' && child.type === 'checkbox'
      );
      if (parentCheckbox) {
        console.log(`Found checkbox as sibling in parent of text: "${text}"`);
        return parentCheckbox;
      }
    }
  }
  
  return null;
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

function base64ToFile(base64String, filename, mimeType) {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:[^;]+;base64,/, '');
  
  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create and return File object
  return new File([bytes], filename, { type: mimeType });
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

// Show popup overlay on the page
function showPopupOverlay() {
  console.log('Showing popup overlay...');
  
  // Check if popup already exists
  if (document.getElementById('sapo-autofill-popup-overlay')) {
    console.log('Popup already visible');
    return;
  }
  
  // Get the extension URL
  const runtimeAPI = typeof browser !== 'undefined' ? browser : chrome;
  let iconURL = '';
  try {
    iconURL = runtimeAPI.runtime.getURL('icons/icon-48.png');
  } catch (e) {
    console.warn('Could not load icon URL:', e);
    // Use a data URL or empty string as fallback
    iconURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiMwMDdBRkYiLz48L3N2Zz4=';
  }
  
  // Create overlay backdrop
  const overlay = document.createElement('div');
  overlay.id = 'sapo-autofill-popup-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  `;
  
  // Create popup container
  const popupContainer = document.createElement('div');
  popupContainer.id = 'sapo-autofill-popup';
  popupContainer.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      #sapo-autofill-popup {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        color: #333;
        background: #ffffff;
        width: 400px;
        max-height: 90vh;
        overflow-y: auto;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
      }
      #sapo-autofill-popup * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      #sapo-autofill-popup .popup-container {
        padding: 20px;
      }
      #sapo-autofill-popup .header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0e0e0;
        position: relative;
      }
      #sapo-autofill-popup .close-btn {
        position: absolute;
        top: 0;
        right: 0;
        background: none;
        border: none;
        font-size: 24px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      }
      #sapo-autofill-popup .close-btn:hover {
        background: #f0f0f0;
        color: #333;
      }
      #sapo-autofill-popup .logo {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }
      #sapo-autofill-popup .header h1 {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        line-height: 1.2;
        flex: 1;
      }
      #sapo-autofill-popup .form-section {
        margin-top: 12px;
      }
      #sapo-autofill-popup .form-group {
        margin-bottom: 14px;
      }
      #sapo-autofill-popup .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 13px;
        color: #555;
      }
      #sapo-autofill-popup input[type="text"],
      #sapo-autofill-popup input[type="email"],
      #sapo-autofill-popup input[type="tel"] {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 13px;
        font-family: inherit;
        transition: border-color 0.2s;
      }
      #sapo-autofill-popup input[type="text"]:focus,
      #sapo-autofill-popup input[type="email"]:focus,
      #sapo-autofill-popup input[type="tel"]:focus {
        outline: none;
        border-color: #007AFF;
      }
      #sapo-autofill-popup .file-input-hidden {
        display: none;
      }
      #sapo-autofill-popup .file-input-wrapper {
        width: 100%;
      }
      #sapo-autofill-popup .file-input-label {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 8px 10px;
        border: 1px dashed #ccc;
        border-radius: 6px;
        background: #f9f9f9;
        cursor: pointer;
        transition: all 0.2s;
      }
      #sapo-autofill-popup .file-input-label:hover {
        border-color: #007AFF;
        background: #f0f8ff;
      }
      #sapo-autofill-popup .file-button {
        display: inline-block;
        padding: 4px 12px;
        background: #007AFF;
        color: white;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        white-space: nowrap;
        transition: background 0.2s;
      }
      #sapo-autofill-popup .file-input-label:hover .file-button {
        background: #0051D5;
      }
      #sapo-autofill-popup .file-name {
        flex: 1;
        font-size: 12px;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #sapo-autofill-popup .file-name.has-file {
        color: #333;
        font-weight: 500;
      }
      #sapo-autofill-popup .file-info {
        display: block;
        margin-top: 4px;
        color: #666;
        font-size: 11px;
      }
      #sapo-autofill-popup .button-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 16px;
      }
      #sapo-autofill-popup button {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      #sapo-autofill-popup .primary-btn {
        background: #007AFF;
        color: white;
      }
      #sapo-autofill-popup .primary-btn:hover {
        background: #0051D5;
      }
      #sapo-autofill-popup .primary-btn:active {
        transform: scale(0.98);
      }
      #sapo-autofill-popup .status-message {
        margin-top: 12px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        display: none;
        animation: slideIn 0.3s ease;
      }
      #sapo-autofill-popup .status-message.success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }
      #sapo-autofill-popup .status-message.error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }
      #sapo-autofill-popup .status-message.info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
      }
      #sapo-autofill-popup .info-box {
        margin-top: 16px;
        padding: 12px;
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
        border-radius: 8px;
        border: 1px solid #d0d7de;
      }
      #sapo-autofill-popup .info-box p {
        margin-bottom: 8px;
        font-size: 13px;
        color: #1a1a1a;
      }
      #sapo-autofill-popup .info-box ul {
        list-style: none;
        margin-left: 0;
        padding-left: 0;
      }
      #sapo-autofill-popup .info-box li {
        padding: 4px 0;
        font-size: 12px;
        color: #555;
        line-height: 1.5;
      }
      #sapo-autofill-popup::-webkit-scrollbar {
        width: 8px;
      }
      #sapo-autofill-popup::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      #sapo-autofill-popup::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
      }
      #sapo-autofill-popup::-webkit-scrollbar-thumb:hover {
        background: #999;
      }
    </style>
    <div class="popup-container">
      <div class="header">
        <img src="${iconURL}" alt="SAPO Emprego Autofill" class="logo">
        <h1>SAPO Emprego Autofill</h1>
        <button class="close-btn" id="sapo-close-popup">&times;</button>
      </div>
      
      <div class="form-section">
        <form id="sapo-autofillForm">
          <div class="form-group">
            <label for="sapo-name">Full Name</label>
            <input type="text" id="sapo-name" name="name" placeholder="Your Full Name" required>
          </div>

          <div class="form-group">
            <label for="sapo-email">Email</label>
            <input type="email" id="sapo-email" name="email" placeholder="your.email@example.com" required>
          </div>

          <div class="form-group">
            <label for="sapo-phone">Phone Number</label>
            <input type="tel" id="sapo-phone" name="phone" placeholder="Your Phone Number" required>
          </div>

          <div class="form-group">
            <label>Photo</label>
            <div class="file-input-wrapper">
              <input type="file" id="sapo-photo" name="photo" accept="image/*" class="file-input-hidden">
              <label for="sapo-photo" class="file-input-label">
                <span class="file-button">Choose File</span>
                <span class="file-name" id="sapo-photoFileName">No file selected</span>
              </label>
            </div>
            <small class="file-info">PNG, JPG, JPEG (optional if already saved)</small>
          </div>

          <div class="form-group">
            <label>CV/Resume (PDF)</label>
            <div class="file-input-wrapper">
              <input type="file" id="sapo-cv" name="cv" accept="application/pdf" class="file-input-hidden">
              <label for="sapo-cv" class="file-input-label">
                <span class="file-button">Choose File</span>
                <span class="file-name" id="sapo-cvFileName">No file selected</span>
              </label>
            </div>
            <small class="file-info">PDF format (optional if already saved)</small>
          </div>

          <div class="button-group">
            <button type="button" id="sapo-saveButton" class="primary-btn">
              💾 Save Data
            </button>
          </div>
          
          <div class="info-box">
            <p><strong>💡 How to use:</strong></p>
            <ul>
              <li>📝 <strong>Single click</strong> the extension icon to fill forms</li>
              <li>✏️ <strong>Double click</strong> the extension icon to edit your data</li>
            </ul>
          </div>

          <div id="sapo-statusMessage" class="status-message"></div>
        </form>
      </div>
    </div>
  `;
  
  overlay.appendChild(popupContainer);
  document.body.appendChild(overlay);
  
  // Setup event handlers
  setupPopupEventHandlers(overlay, popupContainer);
  
  // Load saved data
  loadSavedDataIntoPopup();
  
  console.log('Popup overlay shown');
}

function setupPopupEventHandlers(overlay, popupContainer) {
  // Close button
  const closeBtn = popupContainer.querySelector('#sapo-close-popup');
  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });
  
  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
  
  // Save button
  const saveBtn = popupContainer.querySelector('#sapo-saveButton');
  saveBtn.addEventListener('click', () => savePopupFormData(overlay));
  
  // File input listeners
  setupFileInputListener('sapo-photo', 'sapo-photoFileName');
  setupFileInputListener('sapo-cv', 'sapo-cvFileName');
}

function setupFileInputListener(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  
  if (input && display) {
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
}

async function loadSavedDataIntoPopup() {
  try {
    let data;
    const runtimeAPI = typeof browser !== 'undefined' ? browser : chrome;
    
    if (typeof browser !== 'undefined' && browser.storage) {
      data = await browser.storage.local.get(['formData', 'fileData']);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      data = await new Promise((resolve) => {
        chrome.storage.local.get(['formData', 'fileData'], resolve);
      });
    }
    
    if (data && data.formData) {
      const nameInput = document.getElementById('sapo-name');
      const emailInput = document.getElementById('sapo-email');
      const phoneInput = document.getElementById('sapo-phone');
      
      if (nameInput) nameInput.value = data.formData.name || '';
      if (emailInput) emailInput.value = data.formData.email || '';
      if (phoneInput) phoneInput.value = data.formData.phone || '';
    }
    
    // Update file displays if files are already saved
    if (data && data.fileData) {
      const photoDisplay = document.getElementById('sapo-photoFileName');
      const cvDisplay = document.getElementById('sapo-cvFileName');
      
      if (photoDisplay && data.fileData.photo) {
        photoDisplay.textContent = data.fileData.photo.name + ' (saved)';
        photoDisplay.classList.add('has-file');
      }
      
      if (cvDisplay && data.fileData.cv) {
        cvDisplay.textContent = data.fileData.cv.name + ' (saved)';
        cvDisplay.classList.add('has-file');
      }
    }
  } catch (error) {
    console.error('Error loading data into popup:', error);
  }
}

function showPopupStatus(message, type = 'info') {
  const statusEl = document.getElementById('sapo-statusMessage');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    statusEl.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    }
  }
}

function convertFileToBase64Popup(file) {
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

async function savePopupFormData(overlay) {
  const form = document.getElementById('sapo-autofillForm');
  const formData = new FormData(form);
  
  const name = formData.get('name');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const photoFile = formData.get('photo');
  const cvFile = formData.get('cv');
  
  if (!name || !email || !phone) {
    showPopupStatus('Please fill in all text fields', 'error');
    return;
  }
  
  try {
    showPopupStatus('Saving data...', 'info');
    
    let existingData = {};
    if (typeof browser !== 'undefined' && browser.storage) {
      existingData = await browser.storage.local.get(['fileData']);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      existingData = await new Promise((resolve) => {
        chrome.storage.local.get(['fileData'], resolve);
      });
    }

    const mergedFileData = { ...(existingData.fileData || {}) };

    // Only save files if they're selected
    if (photoFile && photoFile.size > 0) {
      const photoBase64 = await convertFileToBase64Popup(photoFile);
      mergedFileData.photo = {
        name: photoFile.name,
        type: photoFile.type || 'image/png',
        base64: photoBase64
      };
    }
    
    if (cvFile && cvFile.size > 0) {
      const cvBase64 = await convertFileToBase64Popup(cvFile);
      mergedFileData.cv = {
        name: cvFile.name,
        type: cvFile.type || 'application/pdf',
        base64: cvBase64
      };
    }

    const data = {
      formData: { name, email, phone }
    };

    if (Object.keys(mergedFileData).length > 0) {
      data.fileData = mergedFileData;
    }
    
    // Save to browser storage
    if (typeof browser !== 'undefined' && browser.storage) {
      await browser.storage.local.set(data);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      await new Promise((resolve, reject) => {
        chrome.storage.local.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
    
    showPopupStatus('Data saved successfully!', 'success');
    
    // Close popup after a short delay
    setTimeout(() => {
      overlay.remove();
    }, 1500);
  } catch (error) {
    console.error('Error saving data:', error);
    showPopupStatus('Error saving data: ' + error.message, 'error');
  }
}

})(); // End of IIFE to prevent duplicate variable declarations

