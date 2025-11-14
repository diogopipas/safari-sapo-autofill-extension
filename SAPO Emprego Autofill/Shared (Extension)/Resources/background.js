// Background script for SAPO Emprego Autofill Extension

console.log('SAPO Emprego Autofill Extension loaded');

// Track click timing for single/double click detection
let lastClickTime = 0;
let clickTimer = null;
const DOUBLE_CLICK_DELAY = 300; // milliseconds

// Function to fill the form with saved data
async function fillFormWithSavedData(tab) {
  try {
    console.log('Attempting to fill form on tab:', tab.id);
    
    // Get saved data from storage
    let data;
    if (typeof browser !== 'undefined' && browser.storage) {
      data = await browser.storage.local.get(['formData', 'fileData']);
    } else if (typeof chrome !== 'undefined' && chrome.storage) {
      data = await new Promise((resolve) => {
        chrome.storage.local.get(['formData', 'fileData'], resolve);
      });
    }
    
    if (!data || !data.formData || !data.fileData) {
      console.warn('No saved data found');
      // Show notification
      const notificationOptions = {
        type: 'basic',
        iconUrl: (typeof browser !== 'undefined' ? browser : chrome).runtime.getURL('icons/icon-48.png'),
        title: 'SAPO Emprego Autofill',
        message: 'No saved data found. Double-click the icon to add your information.'
      };
      
      if (typeof browser !== 'undefined' && browser.notifications) {
        await browser.notifications.create(notificationOptions);
      } else if (typeof chrome !== 'undefined' && chrome.notifications) {
        chrome.notifications.create(notificationOptions);
      }
      return;
    }
    
    // Send message to content script to fill the form
    console.log('Sending fillForm message to content script');
    if (typeof browser !== 'undefined' && browser.tabs) {
      await browser.tabs.sendMessage(tab.id, {
        action: 'fillForm',
        data: data
      });
    } else if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'fillForm',
        data: data
      });
    }
    
    console.log('Fill form message sent');
  } catch (error) {
    console.error('Error filling form:', error);
  }
}

// Function to open the popup
async function openPopupForEditing(tab) {
  console.log('Opening popup for editing...');
  
  const runtimeAPI = typeof browser !== 'undefined' ? browser : chrome;
  
  try {
    // Send message to content script to show popup overlay on the page
    if (tab && tab.id) {
      if (typeof browser !== 'undefined' && browser.tabs) {
        await browser.tabs.sendMessage(tab.id, { action: 'showPopupOverlay' });
      } else if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.sendMessage(tab.id, { action: 'showPopupOverlay' });
      }
      console.log('Popup overlay message sent');
      return;
    }
  } catch (err) {
    console.error('Error showing popup overlay:', err);
    
    // Fallback: show notification
    console.log('Cannot show popup, showing notification');
    const notificationOptions = {
      type: 'basic',
      iconUrl: runtimeAPI.runtime.getURL('icons/icon-48.png'),
      title: 'SAPO Emprego Autofill',
      message: 'Please refresh the page and try again'
    };
    
    if (runtimeAPI.notifications) {
      if (typeof browser !== 'undefined') {
        await runtimeAPI.notifications.create(notificationOptions);
      } else {
        runtimeAPI.notifications.create(notificationOptions);
      }
    }
  }
}

// Handle extension icon clicks
if (typeof browser !== 'undefined' && browser.action) {
  // Firefox
  browser.action.onClicked.addListener(async (tab) => {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime;
    
    console.log('Extension icon clicked. Time since last click:', timeSinceLastClick);
    
    // Clear any pending single-click timer
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    
    // Check if this is a double-click
    if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
      console.log('Double-click detected - opening popup');
      lastClickTime = 0; // Reset to avoid triple-click triggering
      await openPopupForEditing(tab);
    } else {
      // This might be a single click, wait to see if another click follows
      console.log('Potential single-click - waiting...');
      lastClickTime = currentTime;
      clickTimer = setTimeout(async () => {
        console.log('Single-click confirmed - filling form');
        await fillFormWithSavedData(tab);
        clickTimer = null;
      }, DOUBLE_CLICK_DELAY);
    }
  });
} else if (typeof chrome !== 'undefined' && chrome.action) {
  // Chrome/Safari
  chrome.action.onClicked.addListener((tab) => {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - lastClickTime;
    
    console.log('Extension icon clicked. Time since last click:', timeSinceLastClick);
    
    // Clear any pending single-click timer
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
    }
    
    // Check if this is a double-click
    if (timeSinceLastClick < DOUBLE_CLICK_DELAY) {
      console.log('Double-click detected - opening popup');
      lastClickTime = 0; // Reset to avoid triple-click triggering
      openPopupForEditing(tab);
    } else {
      // This might be a single click, wait to see if another click follows
      console.log('Potential single-click - waiting...');
      lastClickTime = currentTime;
      clickTimer = setTimeout(() => {
        console.log('Single-click confirmed - filling form');
        fillFormWithSavedData(tab);
        clickTimer = null;
      }, DOUBLE_CLICK_DELAY);
    }
  });
}

// Listen for messages from content script (for compatibility)
if (typeof browser !== 'undefined' && browser.runtime) {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
      console.log('Received openPopup message from content script');
      // Use sender.tab which contains the tab info
      openPopupForEditing(sender.tab);
      return true;
    }
  });
} else if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
      console.log('Received openPopup message from content script');
      // Use sender.tab which contains the tab info
      openPopupForEditing(sender.tab);
      return true;
    }
  });
}

