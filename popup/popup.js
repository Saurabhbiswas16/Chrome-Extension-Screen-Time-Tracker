/**
 * Popup Script
 *
 * Responsibilities:
 * 1. Read today's usage data from chrome.storage.local
 * 2. Calculate total screen time
 * 3. Render website-wise usage sorted by time
 */

/**
 * Convert milliseconds to human readable format
 * Example: 7260000 → "2h 1m"
 */
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}

/**
 * Get today's date key
 */
function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

document.addEventListener("DOMContentLoaded", () => {
  const totalTimeEl = document.getElementById("totalTime");
  const siteListEl = document.getElementById("siteList");

  chrome.storage.local.get(["usage"], (result) => {
    const usage = result.usage || {};
    const todayUsage = usage[getTodayKey()] || {};

    // Convert object to array and sort by time spent
    const sites = Object.entries(todayUsage).sort(
      (a, b) => b[1] - a[1]
    );

    let totalTime = 0;

    sites.forEach(([_, time]) => {
      totalTime += time;
    });

    // Update total time
    totalTimeEl.textContent = formatTime(totalTime);

    // Render list
    if (sites.length === 0) {
      siteListEl.innerHTML = `<li class="site-item">No activity today</li>`;
      return;
    }

    sites.forEach(([domain, time]) => {
      const li = document.createElement("li");
      li.className = "site-item";

      li.innerHTML = `
        <span class="site-name">${domain}</span>
        <span class="site-time">${formatTime(time)}</span>
      `;

      siteListEl.appendChild(li);
    });
  });
});

document.getElementById("openDashboard").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/dashboard.html") });
});

