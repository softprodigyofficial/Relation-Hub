// Content script that runs on all web pages
// Detects emails and injects the sidebar

let sidebarIframe: HTMLIFrameElement | null = null;
let isOpen = false;

// Email regex pattern
const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Detect emails on the current page
function detectEmails(): string[] {
  const bodyText = document.body.innerText;
  const emails = bodyText.match(emailPattern) || [];
  return [...new Set(emails)]; // Remove duplicates
}

// Create and inject the sidebar
function createSidebar() {
  if (sidebarIframe) return;

  // Create iframe for sidebar
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.id = 'relationhub-sidebar';
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.style.cssText = `
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100%;
    border: none;
    z-index: 2147483647;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transition: right 0.3s ease-in-out;
    background: white;
  `;

  document.body.appendChild(sidebarIframe);

  // Send detected emails to sidebar
  setTimeout(() => {
    const emails = detectEmails();
    sidebarIframe?.contentWindow?.postMessage({
      type: 'DETECTED_EMAILS',
      emails,
      url: window.location.href
    }, '*');
  }, 1000);
}

// Toggle sidebar visibility
function toggleSidebar() {
  if (!sidebarIframe) {
    createSidebar();
  }

  isOpen = !isOpen;

  if (sidebarIframe) {
    sidebarIframe.style.right = isOpen ? '0' : '-400px';
  }
}

// Remove sidebar
function removeSidebar() {
  if (sidebarIframe) {
    sidebarIframe.remove();
    sidebarIframe = null;
    isOpen = false;
  }
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'TOGGLE_SIDEBAR') {
    toggleSidebar();
    sendResponse({ success: true });
  } else if (message.action === 'DETECT_EMAILS') {
    const emails = detectEmails();
    sendResponse({ emails, url: window.location.href });
  }
  return true;
});

// Listen for messages from sidebar iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'CLOSE_SIDEBAR') {
    toggleSidebar();
  } else if (event.data.type === 'REFRESH_EMAILS') {
    const emails = detectEmails();
    sidebarIframe?.contentWindow?.postMessage({
      type: 'DETECTED_EMAILS',
      emails,
      url: window.location.href
    }, '*');
  }
});

// Create floating toggle button
function createToggleButton() {
  const button = document.createElement('button');
  button.id = 'relationhub-toggle';
  button.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `;
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
    border: none;
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    z-index: 2147483646;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.5)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.4)';
  });

  button.addEventListener('click', toggleSidebar);

  document.body.appendChild(button);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToggleButton);
} else {
  createToggleButton();
}
