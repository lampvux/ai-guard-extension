// Content script for AI Guard extension

let settings = {
  linkProtection: true,
  aiDetection: true,
};

console.log("content.js loaded");
// Get settings from background
chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
  if (response) {
    console.log("settings", response);
    settings = response;
    initializeExtension();
  }
});

function initializeExtension() {
  // Process existing search results
  processSearchResults();

  // Watch for dynamic content changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        processSearchResults();
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function processSearchResults() {
  // Find all search result links
  const searchResults = document.querySelectorAll(
    "div:is(.MjjYud, .A6K0A[data-rpos]):not([data-aiGuard-processed])"
  );

  searchResults.forEach(async (result) => {
    result.setAttribute("data-aiGuard-processed", "true");

    // Find the main link
    const linkElement = result.querySelector("a[href]:not(.fl)");
    if (!linkElement) return;

    const actualUrl = linkElement.href;
    const displayUrlElement = result.querySelector("cite");
    const displayUrl = displayUrlElement ? displayUrlElement.textContent : "";

    // Create indicator container
    const indicatorContainer = document.createElement("div");
    indicatorContainer.className = "aiGuard-indicators";

    // Link protection
    if (settings.linkProtection && displayUrl) {
      const linkIndicator = document.createElement("div");
      linkIndicator.className = "aiGuard-link-indicator";
      linkIndicator.innerHTML =
        '<span class="aiGuard-icon">🔍</span> Checking link...';
      indicatorContainer.appendChild(linkIndicator);

      // Verify link
      chrome.runtime.sendMessage(
        {
          type: "verifyLink",
          url: actualUrl,
          displayUrl: displayUrl.startsWith("http")
            ? displayUrl
            : `https://${displayUrl}`,
        },
        (response) => {
          if (response.safe) {
            linkIndicator.innerHTML =
              '<span class="aiGuard-icon aiGuard-safe">✓</span> Link verified';
            linkIndicator.classList.add("aiGuard-safe");
          } else {
            linkIndicator.innerHTML =
              '<span class="aiGuard-icon aiGuard-warning">⚠</span> Suspicious link';
            linkIndicator.classList.add("aiGuard-warning");

            // Add warning details
            const warningDetails = document.createElement("div");
            warningDetails.className = "aiGuard-warning-details";

            if (response.warnings.domainMismatch) {
              warningDetails.innerHTML += `<div>• Domain mismatch: ${response.actualDomain} ≠ ${response.displayDomain}</div>`;
            }
            if (response.warnings.urlShortener) {
              warningDetails.innerHTML += "<div>• URL shortener detected</div>";
            }
            if (response.warnings.suspicious) {
              warningDetails.innerHTML += "<div>• Suspicious URL pattern</div>";
            }
            if (response.warnings.homograph) {
              warningDetails.innerHTML +=
                "<div>• Possible homograph attack</div>";
            }

            linkIndicator.appendChild(warningDetails);

            // Add click interceptor
            linkElement.addEventListener("click", (e) => {
              if (
                !confirm(
                  "⚠️ Warning: This link may be suspicious.\n\n" +
                    warningDetails.textContent +
                    "\n\nDo you want to continue?"
                )
              ) {
                e.preventDefault();
                e.stopPropagation();
              } else {
                // Store warning for the tab
                chrome.runtime.sendMessage({
                  type: "storeWarning",
                  url: actualUrl,
                });
              }
            });
          }
        }
      );
    }

    // AI content detection
    if (settings.aiDetection) {
      const snippetElement = result.querySelector(".VwiC3b, .yXK7lf, span.st");
      if (snippetElement) {
        const text = snippetElement.textContent;

        const aiIndicator = document.createElement("div");
        aiIndicator.className = "aiGuard-ai-indicator";
        aiIndicator.innerHTML =
          '<span class="aiGuard-icon">🤖</span> Analyzing content...';
        indicatorContainer.appendChild(aiIndicator);

        // Check for AI content
        chrome.runtime.sendMessage(
          {
            type: "checkAIContent",
            text: text,
          },
          (response) => {
            if (response.isAI) {
              aiIndicator.innerHTML = `<span class="aiGuard-icon aiGuard-ai">🤖</span> AI-generated (${response.confidence}% confidence)`;
              aiIndicator.classList.add("aiGuard-ai-detected");

              // Add AI details on hover
              const aiDetails = document.createElement("div");
              aiDetails.className = "aiGuard-ai-details";
              aiDetails.innerHTML = "<strong>AI Indicators:</strong>";

              if (response.indicators.patterns) {
                aiDetails.innerHTML +=
                  "<div>• Common AI phrases detected</div>";
              }
              if (response.indicators.repetitive) {
                aiDetails.innerHTML +=
                  "<div>• Repetitive sentence structure</div>";
              }
              if (response.indicators.formal) {
                aiDetails.innerHTML += "<div>• Overly formal language</div>";
              }
              if (response.indicators.noContractions) {
                aiDetails.innerHTML += "<div>• No contractions used</div>";
              }

              aiIndicator.appendChild(aiDetails);
            } else {
              aiIndicator.innerHTML =
                '<span class="aiGuard-icon aiGuard-human">👤</span> Likely human-written';
              aiIndicator.classList.add("aiGuard-human");
            }
          }
        );
      }
    }

    // Insert indicators after the URL
    if (displayUrlElement && indicatorContainer.children.length > 0) {
      displayUrlElement.parentElement.appendChild(indicatorContainer);
    }
  });
}

// Add styles dynamically
const style = document.createElement("style");
style.textContent = `
  .aiGuard-indicators {
    margin-left: 28px;
    margin-top: 4px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .aiGuard-link-indicator,
  .aiGuard-ai-indicator {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    background: #f0f0f0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    position: relative;
  }
  
  .aiGuard-icon {
    font-size: 14px;
  }
  
  .aiGuard-safe {
    background: #e8f5e9;
    color: #2e7d32;
  }
  
  .aiGuard-warning {
    background: #fff3e0;
    color: #e65100;
    cursor: help;
  }
  
  .aiGuard-ai-detected {
    background: #e3f2fd;
    color: #1565c0;
    cursor: help;
  }
  
  .aiGuard-human {
    background: #f3e5f5;
    color: #6a1b9a;
  }
  
  .aiGuard-warning-details,
  .aiGuard-ai-details {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 4px;
    padding: 8px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    font-size: 11px;
    white-space: nowrap;
    z-index: 1000;
  }
  
  .aiGuard-warning:hover .aiGuard-warning-details,
  .aiGuard-ai-detected:hover .aiGuard-ai-details {
    display: block;
  }
`;
document.head.appendChild(style);
