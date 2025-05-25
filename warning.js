// Warning script for suspicious pages

(function () {
  // Check if warning already exists
  if (document.getElementById("aiGuard-page-warning")) {
    return;
  }

  // Create warning banner
  const warningBanner = document.createElement("div");
  warningBanner.id = "aiGuard-page-warning";
  warningBanner.innerHTML = `
    <div class="aiGuard-warning-content">
      <div class="aiGuard-warning-icon">⚠️</div>
      <div class="aiGuard-warning-text">
        <strong>Security Warning:</strong> This page may contain suspicious content or links.
        <br>
        <span class="aiGuard-warning-details">AI Guard detected potential security risks on this page.</span>
      </div>
      <button class="aiGuard-warning-close" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;

  // Add styles
  const style = document.createElement("style");
  style.textContent = `
    #aiGuard-page-warning {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff5252;
      color: white;
      z-index: 999999;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      animation: slideDown 0.3s ease;
    }
    
    .aiGuard-warning-content {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 20px;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
    }
    
    .aiGuard-warning-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .aiGuard-warning-text {
      flex: 1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .aiGuard-warning-details {
      opacity: 0.9;
      font-size: 12px;
    }
    
    .aiGuard-warning-close {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 5px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    
    .aiGuard-warning-close:hover {
      opacity: 1;
    }
    
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    /* Adjust page content */
    body {
      margin-top: 70px !important;
    }
  `;

  // Insert warning and styles
  document.head.appendChild(style);
  document.body.insertBefore(warningBanner, document.body.firstChild);

  // Remove warning after 30 seconds
  setTimeout(() => {
    if (document.getElementById("aiGuard-page-warning")) {
      document.getElementById("aiGuard-page-warning").remove();
      document.body.style.marginTop = "";
    }
  }, 30000);
})();
