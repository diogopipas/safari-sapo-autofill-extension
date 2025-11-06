// Content script for SAPO Emprego Autofill Extension

console.log('SAPO Autofill Extension loaded');

// Personal information to fill - loaded from userData.js
// Create userData.js from userData.example.js with your information
if (typeof FORM_DATA === 'undefined') {
  console.error('❌ FORM_DATA not loaded! Please create userData.js from userData.example.js');
  const FORM_DATA = {
    name: '',
    email: '',
    phone: ''
  };
}

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


