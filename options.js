// Options page JavaScript

// Load saved settings
document.addEventListener("DOMContentLoaded", () => {
  // Load settings from storage
  chrome.storage.sync.get(["linkProtection", "aiDetection"], (result) => {
    document.getElementById("linkProtection").checked =
      result.linkProtection !== false;
    document.getElementById("aiDetection").checked =
      result.aiDetection !== false;
  });

  // Add event listeners
  document
    .getElementById("linkProtection")
    .addEventListener("change", saveSettings);
  document
    .getElementById("aiDetection")
    .addEventListener("change", saveSettings);
});

// Save settings
function saveSettings() {
  const settings = {
    linkProtection: document.getElementById("linkProtection").checked,
    aiDetection: document.getElementById("aiDetection").checked,
  };

  chrome.storage.sync.set(settings, () => {
    // Show save confirmation
    showSaveStatus();
  });
}

// Show save status
function showSaveStatus() {
  const status = document.getElementById("saveStatus");
  status.textContent = "Settings saved!";
  status.classList.add("show");

  setTimeout(() => {
    status.classList.remove("show");
  }, 2000);
}
