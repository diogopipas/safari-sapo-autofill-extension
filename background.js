// Background script for SAPO Emprego Autofill Extension

// Listen for toolbar button clicks
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we're on a SAPO page
    if (!tab.url || (!tab.url.includes('sapo.pt'))) {
      console.log('Not on a SAPO page');
      return;
    }

    // Inject and execute the autofill script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: autofillForm
    });

    console.log('Autofill triggered successfully');
  } catch (error) {
    console.error('Error triggering autofill:', error);
  }
});

// Function that will be injected into the page
function autofillForm() {
  // Send message to content script to perform autofill
  window.postMessage({ type: 'SAPO_AUTOFILL_TRIGGER' }, '*');
}

