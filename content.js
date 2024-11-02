// Get the entire HTML of the page
const pageHTML = document.documentElement.outerHTML;

// Send HTML to background script
chrome.runtime.sendMessage({ html: pageHTML });
