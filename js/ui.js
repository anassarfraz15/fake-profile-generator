/**
 * ui.js — DOM manipulation, skeleton loaders, section rendering
 */

// ──────────────────────────────────────────────────────────
// Skeleton loader
// ──────────────────────────────────────────────────────────
function showSkeletonLoaders() {
  const profileContent = document.getElementById("profile-content");
  if (!profileContent) return;

  profileContent.innerHTML = `
    <div class="skeleton-wrapper">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text skeleton-h2"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text skeleton-sm"></div>
    </div>
  `;

  const sections = document.getElementById("sections-content");
  if (sections) {
    sections.innerHTML = Array.from({ length: 3 }, () => `
      <div class="card skeleton-card">
        <div class="skeleton skeleton-text skeleton-h3"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text skeleton-sm"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    `).join("");
  }
}

// ──────────────────────────────────────────────────────────
// Render the full profile UI
// ──────────────────────────────────────────────────────────
function renderProfile(profile, photoSrc) {
  renderSidebar(profile, photoSrc);
  renderSections(profile);
}

function renderSidebar(profile, photoSrc) {
  const el = document.getElementById("profile-content");
  if (!el) return;

  const statusColor = {
    Active: "#22c55e",
    Away: "#f59e0b",
    Offline: "#6b7280",
  }[profile.onlineStatus] || "#6b7280";

  const imgSrc = photoSrc || getPlaceholderSVG(profile.gender);

  el.innerHTML = `
    <div class="profile-photo-wrap">
      <img id="profile-photo" src="${imgSrc}" alt="Profile photo of ${escHtml(profile.fullName)}" class="profile-photo"/>
      <span class="online-dot" style="background:${statusColor}" title="${escHtml(profile.onlineStatus)}"></span>
    </div>
    <div class="profile-header-info">
      <h2 class="profile-name">
        ${escHtml(profile.fullName)}
        <button class="copy-btn icon-btn" data-copy="${escHtml(profile.fullName)}" title="Copy name">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
      </h2>
      <p class="profile-age">${profile.age} years old &bull; ${profile.gender}</p>
      <p class="profile-dob">Born: ${escHtml(profile.dob.formatted)}</p>
      <p class="profile-location">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        ${escHtml(profile.address.city)}, ${escHtml(profile.address.state)}, ${escHtml(profile.address.country)}
      </p>
      <p class="profile-headline">${escHtml(profile.headline)}</p>
      <div class="online-status">
        <span class="dot" style="background:${statusColor}"></span>
        ${escHtml(profile.onlineStatus)}
      </div>
    </div>

    <div class="seed-display">
      <span>Seed: <strong>${profile.seed}</strong></span>
    </div>
  `;

  // Wire copy buttons
  el.querySelectorAll(".copy-btn[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await copyToClipboard(btn.dataset.copy);
      showCopiedTooltip(btn);
    });
  });
}

function renderSections(profile) {
  const el = document.getElementById("sections-content");
  if (!el) return;

  const sections = [
    renderBasicInfo(profile),
    renderAddress(profile),
  ];

  // Show employment section only when the toggle was enabled
  if (profile.showEmployment) {
    sections.push(renderEmployment(profile));
  }

  sections.push(renderPersonal(profile));
  sections.push(renderBio(profile));

  el.innerHTML = sections.join("");

  // Wire all copy buttons in sections
  el.querySelectorAll(".copy-btn[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await copyToClipboard(btn.dataset.copy);
      showCopiedTooltip(btn);
    });
  });
}

// ──────────────────────────────────────────────────────────
// Section builders
// ──────────────────────────────────────────────────────────
function renderBasicInfo(profile) {
  const rows = [
    infoRow("Email", escHtml(profile.email), profile.email),
    infoRow("Phone", escHtml(profile.phone), profile.phone),
    infoRow("Height", `${profile.height.cm} cm &bull; ${escHtml(profile.height.ftIn)}`),
    infoRow("Weight", `${profile.weight.kg} kg &bull; ${profile.weight.lbs} lbs`),
    infoRow("Hair Color", escHtml(profile.hairColor)),
    infoRow("Blood Type", escHtml(profile.bloodType)),
    infoRow("Civil Status", escHtml(profile.civilStatus)),
    infoRow("Education", `${escHtml(profile.education.level)} &bull; ${escHtml(profile.education.grade)}`),
    infoRow("School Type", escHtml(profile.education.schoolType)),
  ];
  return card("Basic Info", rows.join(""));
}

function renderAddress(profile) {
  const a = profile.address;
  const fullAddr = `${a.street}, ${a.city}, ${a.state}, ${a.postalCode}, ${a.country}`;
  const rows = [
    infoRow("Street", escHtml(a.street)),
    infoRow("City", escHtml(a.city)),
    infoRow("State / Province", escHtml(a.state)),
    infoRow("Postal Code", escHtml(a.postalCode)),
    infoRow("Country", escHtml(a.country)),
    `<div class="info-row copy-row">
      <span class="info-label">Full Address</span>
      <span class="info-value">
        ${escHtml(fullAddr)}
        <button class="copy-btn icon-btn" data-copy="${escHtml(fullAddr)}" title="Copy address">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        </button>
      </span>
    </div>`,
  ];
  return card("Address", rows.join(""));
}

function renderEmployment(profile) {
  const emp = profile.employment;
  if (emp.tooYoung) {
    return card("Employment", `<p class="note">${escHtml(emp.note)}</p>`);
  }
  if (emp.status === "Unemployed") {
    return card("Employment", infoRow("Status", "Unemployed"));
  }
  if (emp.status === "Retired") {
    return card("Employment", infoRow("Status", "Retired"));
  }
  if (emp.status === "Student") {
    return card("Employment", infoRow("Status", `Student &mdash; ${escHtml(emp.note || "")}`));
  }

  const rows = [
    infoRow("Status", escHtml(emp.status)),
    infoRow("Job Title", escHtml(emp.title)),
    infoRow("Company", escHtml(emp.company)),
    infoRow("Industry", escHtml(emp.industry)),
    infoRow("Company Size", escHtml(emp.companySize)),
    infoRow("Monthly Salary", escHtml(emp.salary)),
  ];
  return card("Employment", rows.join(""));
}

function renderPersonal(profile) {
  const rows = [
    infoRow("Family", `${profile.family.members} members &mdash; ${escHtml(profile.family.description)}`),
    infoRow("Vehicle", escHtml(profile.vehicle)),
    infoRow("Hobbies", escHtml(profile.hobbies.join(", "))),
  ];

  if (profile.favorites) {
    rows.push(infoRow("Fav. Color", escHtml(profile.favorites.color)));
    rows.push(infoRow("Fav. Movie", escHtml(profile.favorites.movie)));
    rows.push(infoRow("Fav. Music", escHtml(profile.favorites.musicGenre)));
    rows.push(infoRow("Fav. Song", escHtml(profile.favorites.song)));
    rows.push(infoRow("Fav. Book", escHtml(profile.favorites.book)));
  }

  return card("Personal &amp; Favorites", rows.join(""));
}

function renderBio(profile) {
  return card(
    "Bio",
    `<div class="bio-text">
      <p>${escHtml(profile.bio)}</p>
      <button class="copy-btn btn-secondary btn-sm bio-copy" data-copy="${escHtml(profile.bio)}" title="Copy bio">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy Bio
      </button>
    </div>`
  );
}

// ──────────────────────────────────────────────────────────
// HTML helpers
// ──────────────────────────────────────────────────────────
function card(title, content) {
  return `
    <section class="card">
      <h3 class="card-title">${title}</h3>
      <div class="card-body">${content}</div>
    </section>
  `;
}

function infoRow(label, value, copyValue) {
  const copyBtn = copyValue
    ? `<button class="copy-btn icon-btn" data-copy="${escHtml(copyValue)}" title="Copy ${label.toLowerCase()}">
         <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
       </button>`
    : "";
  return `
    <div class="info-row">
      <span class="info-label">${label}</span>
      <span class="info-value">${value}${copyBtn}</span>
    </div>
  `;
}

/**
 * Escape HTML special characters to prevent XSS.
 */
function escHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ──────────────────────────────────────────────────────────
// Photo update (Regenerate Photo Only)
// ──────────────────────────────────────────────────────────
function updateProfilePhoto(src) {
  const img = document.getElementById("profile-photo");
  if (img) {
    img.src = src;
    img.classList.add("photo-loaded");
  }
}

function showPhotoLoading() {
  const img = document.getElementById("profile-photo");
  if (img) {
    img.style.opacity = "0.4";
  }
  const wrap = document.querySelector(".profile-photo-wrap");
  if (wrap) {
    let spinner = wrap.querySelector(".photo-spinner");
    if (!spinner) {
      spinner = document.createElement("div");
      spinner.className = "photo-spinner";
      wrap.appendChild(spinner);
    }
  }
}

function hidePhotoLoading() {
  const img = document.getElementById("profile-photo");
  if (img) {
    img.style.opacity = "1";
  }
  const spinner = document.querySelector(".photo-spinner");
  if (spinner) spinner.remove();
}

// ──────────────────────────────────────────────────────────
// State dropdown population
// ──────────────────────────────────────────────────────────
function populateStateDropdown(countryCode) {
  const stateSelect = document.getElementById("state-select");
  if (!stateSelect) return;

  const states = DATA.states[countryCode] || [];
  stateSelect.innerHTML = `<option value="">Any State/Province</option>`;
  states.forEach((s, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = s.name;
    stateSelect.appendChild(opt);
  });
}

// ──────────────────────────────────────────────────────────
// Country dropdown population
// ──────────────────────────────────────────────────────────
function populateCountryDropdown() {
  const sel = document.getElementById("country-select");
  if (!sel) return;

  Object.entries(DATA.countries).forEach(([code, info]) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = info.name;
    if (code === "US") opt.selected = true;
    sel.appendChild(opt);
  });
}

// ──────────────────────────────────────────────────────────
// Empty state (no profile generated yet)
// ──────────────────────────────────────────────────────────
function showEmptyState() {
  const profileContent = document.getElementById("profile-content");
  if (profileContent) {
    profileContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#e2e8f0" stroke-width="3"/>
            <circle cx="40" cy="32" r="13" fill="#e2e8f0"/>
            <path d="M14 66c0-14.36 11.64-26 26-26s26 11.64 26 26" fill="#e2e8f0"/>
          </svg>
        </div>
        <p class="empty-text">Configure filters and click <strong>Generate Profile</strong> to get started.</p>
      </div>
    `;
  }
  const sections = document.getElementById("sections-content");
  if (sections) sections.innerHTML = "";
}
