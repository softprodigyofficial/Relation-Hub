// Background service worker for the Chrome extension

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('RelationHub extension installed');
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('index.html')
    });
  }
});

// Handle toolbar icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    // Toggle sidebar in the active tab
    chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_SIDEBAR' });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true;
  }

  if (message.action === 'DETECT_EMAILS_IN_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'DETECT_EMAILS' },
          (response) => {
            sendResponse(response);
          }
        );
      }
    });
    return true;
  }

  return false;
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected:', port.name);
});

// Handle keyboard shortcuts (if defined in manifest)
chrome.commands?.onCommand.addListener((command) => {
  if (command === 'toggle-sidebar') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'TOGGLE_SIDEBAR' });
      }
    });
  }
});
