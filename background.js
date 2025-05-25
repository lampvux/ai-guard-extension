// Background service worker for AI Guard extension

// Store settings
let settings = {
  linkProtection: true,
  aiDetection: true,
};

// Load settings from storage
chrome.storage.sync.get(["linkProtection", "aiDetection"], (result) => {
  if (result.linkProtection !== undefined)
    settings.linkProtection = result.linkProtection;
  if (result.aiDetection !== undefined)
    settings.aiDetection = result.aiDetection;
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync") {
    if (changes.linkProtection)
      settings.linkProtection = changes.linkProtection.newValue;
    if (changes.aiDetection)
      settings.aiDetection = changes.aiDetection.newValue;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getSettings") {
    sendResponse(settings);
    return true;
  }

  if (request.type === "verifyLink") {
    verifyLink(request.url, request.displayUrl).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (request.type === "checkAIContent") {
    checkAIContent(request.text).then((result) => {
      sendResponse(result);
    });
    return true;
  }
});

// Verify if the actual link matches the displayed URL
async function verifyLink(actualUrl, displayUrl) {
  try {
    // Extract domain from URLs
    const actualDomain = new URL(actualUrl).hostname.replace("www.", "");
    const displayDomain = new URL(displayUrl).hostname.replace("www.", "");

    // Check if domains match
    const isMatching = actualDomain === displayDomain;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP addresses
      /bit\.ly|tinyurl|goo\.gl|ow\.ly|is\.gd|buff\.ly/, // URL shorteners
      /[а-яА-Я]/, // Cyrillic characters (often used in phishing)
      /xn--/, // Punycode domains
    ];

    const isSuspicious = suspiciousPatterns.some((pattern) =>
      pattern.test(actualUrl)
    );

    // Check for homograph attacks (lookalike characters)
    const homographs = {
      o: ["0", "о"], // Latin o vs zero vs Cyrillic o
      a: ["а", "ɑ"], // Latin a vs Cyrillic a
      e: ["е", "ё"], // Latin e vs Cyrillic e
      i: ["і", "1", "l"], // Various lookalikes
      c: ["с"], // Latin c vs Cyrillic c
    };

    let hasHomograph = false;
    for (const [char, lookalikes] of Object.entries(homographs)) {
      if (actualDomain.includes(char) && displayDomain.includes(char)) {
        for (const lookalike of lookalikes) {
          if (
            actualDomain.includes(lookalike) ||
            displayDomain.includes(lookalike)
          ) {
            hasHomograph = true;
            break;
          }
        }
      }
    }

    return {
      safe: isMatching && !isSuspicious && !hasHomograph,
      actualDomain,
      displayDomain,
      warnings: {
        domainMismatch: !isMatching,
        suspicious: isSuspicious,
        homograph: hasHomograph,
        urlShortener: /bit\.ly|tinyurl|goo\.gl|ow\.ly|is\.gd|buff\.ly/.test(
          actualUrl
        ),
      },
    };
  } catch (error) {
    console.error("Error verifying link:", error);
    return {
      safe: false,
      error: true,
      message: error.message,
    };
  }
}

// Check if content is AI-generated
async function checkAIContent(text) {
  try {
    // This is a simplified AI detection algorithm
    // In a real implementation, you might want to use an API service

    // Common AI patterns
    const aiPatterns = [
      /as an ai language model/i,
      /i don't have personal (opinions|experiences|feelings)/i,
      /it's important to note that/i,
      /however, it's worth mentioning/i,
      /in conclusion,/i,
      /to summarize,/i,
      /here are some key points/i,
      /let me explain/i,
      /I must clarify/i,
      /it's crucial to understand/i,
    ];

    // Check for repetitive sentence structures
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceStarters = sentences.map((s) =>
      s.trim().split(" ").slice(0, 3).join(" ").toLowerCase()
    );
    const uniqueStarters = new Set(sentenceStarters);
    const repetitiveStructure =
      sentenceStarters.length > 5 &&
      uniqueStarters.size < sentenceStarters.length * 0.6;

    // Check for overly formal or consistent tone
    const formalWords =
      /furthermore|moreover|nevertheless|consequently|accordingly|hence|thus/gi;
    const formalWordCount = (text.match(formalWords) || []).length;
    const wordCount = text.split(/\s+/).length;
    const formalityRatio = formalWordCount / wordCount;

    // Calculate AI probability score
    let aiScore = 0;

    // Check patterns
    aiPatterns.forEach((pattern) => {
      if (pattern.test(text)) aiScore += 15;
    });

    // Check repetitive structure
    if (repetitiveStructure) aiScore += 20;

    // Check formality
    if (formalityRatio > 0.02) aiScore += 10;

    // Check for perfect grammar (no contractions, consistent punctuation)
    const hasContractions =
      /\b(don't|won't|can't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|didn't|wouldn't|shouldn't|couldn't|mightn't|mustn't)\b/i.test(
        text
      );
    if (!hasContractions && text.length > 200) aiScore += 10;

    // Normalize score to 0-100
    aiScore = Math.min(100, aiScore);

    return {
      isAI: aiScore > 50,
      confidence: aiScore,
      indicators: {
        patterns: aiPatterns.some((p) => p.test(text)),
        repetitive: repetitiveStructure,
        formal: formalityRatio > 0.02,
        noContractions: !hasContractions,
      },
    };
  } catch (error) {
    console.error("Error checking AI content:", error);
    return {
      isAI: false,
      error: true,
      message: error.message,
    };
  }
}

// Listen for tab updates to inject warning if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && settings.linkProtection) {
    // Check if this tab was flagged as potentially dangerous
    chrome.storage.session.get(`warning_${tabId}`, (result) => {
      if (result[`warning_${tabId}`]) {
        // Inject warning script
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["warning.js"],
        });
      }
    });
  }
});
