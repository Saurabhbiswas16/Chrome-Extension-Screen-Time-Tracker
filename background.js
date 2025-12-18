/**
 * Screen Time Tracker – Background Service Worker
 *
 * Responsibilities:
 * 1. Track active tab & window focus
 * 2. Calculate time spent per domain
 * 3. Store daily usage in chrome.storage.local
 * 4. Reset data automatically when the date changes
 *
 * NOTE:
 * - Time is counted ONLY when:
 *   - A tab is active
 *   - Chrome window is focused
 * - Time is stored per domain (not full URL)
 */

// -----------------------------
// In-memory runtime state
// -----------------------------

let activeTabId = null;
let activeDomain = null;
let activeStartTime = null;
let isWindowFocused = true;

// -----------------------------
// Utility functions
// -----------------------------

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayKey() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Extract domain name from a URL
 * Example: https://www.youtube.com/watch?v=abc -> youtube.com
 */
function getDomainFromUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch (e) {
    return null; // invalid or chrome:// URL
  }
}

/**
 * Save elapsed time to storage for the active domain
 */
async function saveElapsedTime() {
  if (!activeDomain || !activeStartTime) return;

  const elapsedMs = Date.now() - activeStartTime;
  const todayKey = getTodayKey();

  chrome.storage.local.get(["usage"], (result) => {
    const usage = result.usage || {};
    usage[todayKey] = usage[todayKey] || {};
    usage[todayKey][activeDomain] =
      (usage[todayKey][activeDomain] || 0) + elapsedMs;

    chrome.storage.local.set({ usage });
  });

  // Reset start time after saving
  activeStartTime = Date.now();
}

/**
 * Stop tracking current tab
 */
function stopTracking() {
  if (activeDomain && activeStartTime) {
    saveElapsedTime();
  }

  activeTabId = null;
  activeDomain = null;
  activeStartTime = null;
}

/**
 * Start tracking a new tab/domain
 */
function startTracking(tab) {
  const domain = getDomainFromUrl(tab.url);
  if (!domain) return;

  activeTabId = tab.id;
  activeDomain = domain;
  activeStartTime = Date.now();
}

// -----------------------------
// Event Listeners
// -----------------------------

/**
 * Fired when the active tab changes
 */
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!isWindowFocused) return;

  // Stop previous tracking
  stopTracking();

  // Get new active tab
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    startTracking(tab);
  });
});

/**
 * Fired when a tab is updated (URL change, reload, etc.)
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId !== activeTabId) return;
  if (!changeInfo.url) return;

  // URL changed → stop old domain, start new one
  stopTracking();
  startTracking(tab);
});

/**
 * Fired when the Chrome window gains or loses focus
 */
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    isWindowFocused = false;
    stopTracking();
  } else {
    // Browser gained focus
    isWindowFocused = true;

    // Resume tracking current active tab
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        startTracking(tabs[0]);
      }
    });
  }
});

/**
 * Fired when a tab is closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    stopTracking();
  }
});

// -----------------------------
// Daily reset logic
// -----------------------------

/**
 * Alarm to ensure date rollover is handled correctly
 * Runs every 1 minute
 */
chrome.alarms.create("daily-check", {
  periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "daily-check") return;

  chrome.storage.local.get(["lastDate"], (result) => {
    const todayKey = getTodayKey();
    const lastDate = result.lastDate;

    if (lastDate !== todayKey) {
      // New day detected
      chrome.storage.local.set({ lastDate: todayKey });

      // Stop current tracking session to avoid leaking time into new day
      stopTracking();
    }
  });
});

// -----------------------------
// Service Worker lifecycle
// -----------------------------

/**
 * When service worker starts (browser restart / extension reload)
 * initialize lastDate if not present
 */
chrome.runtime.onStartup.addListener(() => {
  const todayKey = getTodayKey();
  chrome.storage.local.set({ lastDate: todayKey });
});

chrome.runtime.onInstalled.addListener(() => {
  const todayKey = getTodayKey();
  chrome.storage.local.set({ lastDate: todayKey });
});
