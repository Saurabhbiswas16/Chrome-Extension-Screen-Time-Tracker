function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function drawChart(data) {
  const canvas = document.getElementById("usageChart");
  const ctx = canvas.getContext("2d");

  const entries = Object.entries(data);
  if (entries.length === 0) return;

  const maxValue = Math.max(...entries.map(([, v]) => v));
  const barWidth = canvas.width / entries.length;
  let progress = 0;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    entries.forEach(([domain, value], index) => {
      const targetHeight = (value / maxValue) * (canvas.height - 40);
      const barHeight = targetHeight * progress;

      const x = index * barWidth;
      const y = canvas.height - barHeight;

      ctx.fillStyle = "#4f46e5";
      ctx.fillRect(x + 10, y, barWidth - 20, barHeight);

      ctx.fillStyle = "#333";
      ctx.font = "10px sans-serif";
      ctx.fillText(domain, x + 10, canvas.height - 5);
    });

    progress += 0.05;
    if (progress <= 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}


function renderForDate(dateKey, usage) {
  const totalTimeEl = document.getElementById("totalTime");
  const siteListEl = document.getElementById("siteList");
  const selectedDateEl = document.getElementById("selectedDate");

  const dayUsage = usage[dateKey] || {};
  selectedDateEl.textContent = dateKey;

  siteListEl.innerHTML = "";

  let total = 0;
  Object.values(dayUsage).forEach((v) => (total += v));
  totalTimeEl.textContent = formatTime(total);

  const sorted = Object.entries(dayUsage).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    siteListEl.innerHTML = "<li>No activity recorded</li>";
    drawChart({});
    return;
  }

  sorted.forEach(([domain, time]) => {
    const li = document.createElement("li");
    li.className = "site-item";
    li.innerHTML = `
      <span>${domain}</span>
      <strong>${formatTime(time)}</strong>
    `;
    siteListEl.appendChild(li);
  });

  drawChart(dayUsage);
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function renderWeeklySummary(usage) {
  const weeklyTotalEl = document.getElementById("weeklyTotal");
  const weeklyTopSitesEl = document.getElementById("weeklyTopSites");
  const canvas = document.getElementById("weeklyChart");
  const ctx = canvas.getContext("2d");

  const days = getLast7Days();
  const dailyTotals = [];
  const siteTotals = {};

  let weeklyTotal = 0;

  days.forEach((day) => {
    const dayUsage = usage[day] || {};
    let dayTotal = 0;

    Object.entries(dayUsage).forEach(([domain, time]) => {
      dayTotal += time;
      siteTotals[domain] = (siteTotals[domain] || 0) + time;
    });

    weeklyTotal += dayTotal;
    dailyTotals.push(dayTotal);
  });

  weeklyTotalEl.textContent = formatTime(weeklyTotal);

  // ---- Render top sites ----
  weeklyTopSitesEl.innerHTML = "";

  const topSites = Object.entries(siteTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  topSites.forEach(([domain, time]) => {
    const li = document.createElement("li");
    li.className = "weekly-site";
    li.innerHTML = `
      <span>${domain}</span>
      <strong>${formatTime(time)}</strong>
    `;
    weeklyTopSitesEl.appendChild(li);
  });

  // ---- Draw weekly bar chart ----
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...dailyTotals, 1);
  const barWidth = canvas.width / days.length;

  dailyTotals.forEach((value, index) => {
    const barHeight = (value / max) * (canvas.height - 40);
    const x = index * barWidth;
    const y = canvas.height - barHeight;

    ctx.fillStyle = "#10b981";
    ctx.fillRect(x + 10, y, barWidth - 20, barHeight);

    ctx.fillStyle = "#333";
    ctx.font = "10px sans-serif";
    ctx.fillText(days[index].slice(5), x + 10, canvas.height - 5);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const datePicker = document.getElementById("datePicker");

  chrome.storage.local.get(["usage"], (result) => {
    const usage = result.usage || {};
    const today = new Date().toISOString().split("T")[0];

    // Set date picker defaults
    datePicker.value = today;
    datePicker.max = today;

    renderForDate(today, usage);

    datePicker.addEventListener("change", (e) => {
      renderForDate(e.target.value, usage);
    });
  });
  renderWeeklySummary(usage);
});
