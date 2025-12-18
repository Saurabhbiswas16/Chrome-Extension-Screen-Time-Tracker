# ⏱️ Screen Time Tracker --- Chrome Extension

Track how much time you spend on each website and visualize your daily
and weekly browsing habits in a clean, privacy-friendly dashboard.

------------------------------------------------------------------------

## 🚀 Features

-   ⏳ Automatic website time tracking
-   🌐 Domain-level tracking (e.g. youtube.com)
-   📅 Daily screen time summary
-   📊 Dashboard with charts
-   📆 Date picker to view previous days
-   📈 Weekly summary (last 7 days)
-   💾 Persistent local storage
-   🔒 100% privacy-friendly (no backend, no data sync)

------------------------------------------------------------------------

## 🧠 How It Works

-   Tracks time only when:
    -   The Chrome tab is active
    -   The Chrome window is focused
-   Aggregates usage by domain
-   Stores data locally using `chrome.storage.local`
-   Resets automatically at midnight (local time)

------------------------------------------------------------------------

## 🧩 Tech Stack

-   Chrome Extensions Manifest V3
-   Vanilla JavaScript (ES Modules)
-   HTML + CSS
-   Canvas API (for charts)
-   No external libraries

------------------------------------------------------------------------

## 📁 Project Structure

    screen-time-tracker/
    │
    ├── manifest.json
    ├── background.js
    │
    ├── popup/
    │   ├── popup.html
    │   ├── popup.css
    │   └── popup.js
    │
    ├── dashboard/
    │   ├── dashboard.html
    │   ├── dashboard.css
    │   └── dashboard.js
    │
    └── icons/
        ├── icon16.png
        ├── icon32.png
        ├── icon48.png
        └── icon128.png

------------------------------------------------------------------------

## 🔐 Permissions Explained

  Permission            Why it's needed
  --------------------- ---------------------------
  tabs                  Detect active tab and URL
  storage               Persist usage data
  alarms                Handle daily reset
  `<all_urls>`{=html}   Read domain names

------------------------------------------------------------------------

## 🧪 Local Development & Testing

### Clone the Repository

``` bash
git clone https://github.com/your-username/screen-time-tracker.git
cd screen-time-tracker
```

### Load Extension in Chrome

1.  Open chrome://extensions
2.  Enable Developer Mode
3.  Click Load unpacked
4.  Select the project root folder

------------------------------------------------------------------------

## 📊 Dashboard Access

-   Click **Open Dashboard** from the popup
-   Or open directly using the extension URL

------------------------------------------------------------------------

## 🛡️ Privacy & Data Policy

-   All data is stored locally
-   No analytics or server calls
-   No personal data collected

------------------------------------------------------------------------

## 📦 Deployment

-   Free for local use and GitHub submission
-   Optional Chrome Web Store publishing (one-time \$5 fee)

------------------------------------------------------------------------

## 📝 Assignment Submission Checklist

-   Public GitHub repository
-   Manifest V3 compliant
-   Background service worker
-   Popup UI
-   Dashboard with charts & history
-   Weekly summary
-   Clean README
-   AI prompt history - https://chatgpt.com/share/69441e6f-f0ac-8005-8506-9d40191fb065

------------------------------------------------------------------------

## 👨‍💻 Author

Saurabh Biswas
