/**
 * utils.js — Utility functions: seeded PRNG, clipboard, download, formatting
 */

// ──────────────────────────────────────────────────────────
// Seeded PRNG — mulberry32
// Returns a function that generates floats in [0, 1)
// ──────────────────────────────────────────────────────────
function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Pick a random integer in [min, max] inclusive using seeded rng.
 */
function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Pick a random item from an array using seeded rng.
 */
function randItem(rng, arr) {
  return arr[randInt(rng, 0, arr.length - 1)];
}

/**
 * Pick a random item using weighted probabilities.
 * @param {function} rng
 * @param {Array} items
 * @param {number[]} weights — same length as items
 */
function randWeighted(rng, items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Shuffle array in-place using seeded rng.
 */
function shuffle(rng, arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate a random numeric seed.
 */
function generateSeed() {
  return Math.floor(Math.random() * 999999999) + 1;
}

// ──────────────────────────────────────────────────────────
// Clipboard
// ──────────────────────────────────────────────────────────
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }
}

/**
 * Show a "Copied!" tooltip near a button element.
 */
function showCopiedTooltip(btn) {
  const existing = btn.querySelector(".tooltip");
  if (existing) existing.remove();

  const tip = document.createElement("span");
  tip.className = "tooltip";
  tip.textContent = "Copied!";
  btn.appendChild(tip);

  setTimeout(() => tip.remove(), 1800);
}

// ──────────────────────────────────────────────────────────
// Download helpers
// ──────────────────────────────────────────────────────────
function downloadJSON(profile) {
  const json = JSON.stringify(profile, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `profile-${profile.seed}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadPNG(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // html2canvas must be loaded from CDN
  if (typeof html2canvas === "undefined") {
    showToast("html2canvas not loaded. Cannot export PNG.", "error");
    return;
  }

  try {
    showToast("Generating PNG…", "info");
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f8fafc",
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile-${Date.now()}.png`;
    a.click();
  } catch (e) {
    showToast("Failed to generate PNG: " + e.message, "error");
  }
}

// ──────────────────────────────────────────────────────────
// Toast notifications
// ──────────────────────────────────────────────────────────
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add("toast-visible");
  });

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ──────────────────────────────────────────────────────────
// Date / formatting helpers
// ──────────────────────────────────────────────────────────

/**
 * Format a date object to a human-readable string.
 */
function formatDate(dateObj) {
  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Calculate age from a date of birth.
 */
function calcAge(dob) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/**
 * Generate a DOB Date object that yields a specific age.
 * Uses the seed RNG to randomise day/month within the age year.
 */
function ageToDoB(rng, targetAge) {
  const today = new Date();
  const year = today.getFullYear() - targetAge;
  const month = randInt(rng, 0, 11); // 0–11
  const maxDay = new Date(year, month + 1, 0).getDate();
  const day = randInt(rng, 1, maxDay);
  const dob = new Date(year, month, day);

  // Adjust: if birthday hasn't happened yet this year, subtract 1 from year
  const birthdayThisYear = new Date(today.getFullYear(), month, day);
  if (birthdayThisYear > today) {
    dob.setFullYear(dob.getFullYear() - 1);
  }
  return dob;
}

/**
 * Format height from cm to ft/in string.
 */
function cmToFtIn(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

/**
 * Convert kg to lbs.
 */
function kgToLbs(kg) {
  return Math.round(kg * 2.20462);
}

/**
 * Format a number with commas for thousands separators.
 */
function formatNumber(n) {
  return n.toLocaleString();
}

/**
 * Pad a number with leading zeros.
 */
function pad(n, width) {
  return String(n).padStart(width, "0");
}

/**
 * Capitalise first letter.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
