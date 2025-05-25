// Popup JavaScript

document.addEventListener("DOMContentLoaded", () => {
  // Load current settings and update status
  chrome.storage.sync.get(["linkProtection", "aiDetection"], (result) => {
    updateStatus("link", result.linkProtection !== false);
    updateStatus("ai", result.aiDetection !== false);
  });

  // Open options page
  document.getElementById("openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Refresh current tab
  document.getElementById("refreshPage").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
        window.close();
      }
    });
  });
});

// Update status display
function updateStatus(type, isActive) {
  const statusIcon = document.getElementById(`${type}Status`);
  const statusText = document.getElementById(`${type}StatusText`);

  if (isActive) {
    statusIcon.textContent = "✓";
    statusIcon.className = "status-icon active";
    statusText.textContent = "Active";
  } else {
    statusIcon.textContent = "✗";
    statusIcon.className = "status-icon inactive";
    statusText.textContent = "Inactive";
  }
}
