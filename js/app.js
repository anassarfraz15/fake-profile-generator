/**
 * app.js — Main app controller: event wiring, UI orchestration
 */

(function () {
  "use strict";

  // ── State ───────────────────────────────────────────────────
  let currentProfile = null;
  let currentPhotoSrc = null;
  let isGenerating = false;

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", () => {
    populateCountryDropdown();
    populateStateDropdown("US");
    showEmptyState();
    restoreApiKey();
    initAgeToggle();
    initAccordion();
    wireEvents();
  });

  // ── Event Wiring ────────────────────────────────────────────
  function wireEvents() {
    // Country change → repopulate states
    document.getElementById("country-select").addEventListener("change", (e) => {
      populateStateDropdown(e.target.value);
    });

    // Generate profile
    document.getElementById("generate-btn").addEventListener("click", handleGenerate);

    // Regenerate photo only
    document.getElementById("regen-photo-btn").addEventListener("click", handleRegenPhoto);

    // Download JSON
    document.getElementById("download-json-btn").addEventListener("click", () => {
      if (!currentProfile) { showToast("Generate a profile first.", "error"); return; }
      downloadJSON(currentProfile);
    });

    // Download PNG
    document.getElementById("download-png-btn").addEventListener("click", () => {
      if (!currentProfile) { showToast("Generate a profile first.", "error"); return; }
      downloadPNG("app-capture");
    });

    // Settings modal
    document.getElementById("settings-btn").addEventListener("click", openSettings);
    document.getElementById("settings-close-btn").addEventListener("click", closeSettings);
    document.getElementById("settings-overlay").addEventListener("click", closeSettings);
    document.getElementById("save-api-key-btn").addEventListener("click", saveApiKey);
    document.getElementById("clear-api-key-btn").addEventListener("click", clearApiKey);

    // Seed input — allow re-generate with custom seed
    document.getElementById("seed-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleGenerate();
    });
  }

  // ── Generate Profile ────────────────────────────────────────
  async function handleGenerate() {
    if (isGenerating) return;

    const filters = readFilters();
    if (!validateFilters(filters)) return;

    // Determine seed
    const seedInput = document.getElementById("seed-input").value.trim();
    const seed = seedInput ? Math.abs(parseInt(seedInput, 10)) || generateSeed() : generateSeed();
    document.getElementById("seed-input").value = seed;

    isGenerating = true;
    setGenerateButtonState(true);
    showSkeletonLoaders();

    try {
      // Generate profile data (synchronous)
      currentProfile = generateProfile(filters, seed);
      currentPhotoSrc = null;

      // Render immediately with placeholder photo
      renderProfile(currentProfile, null);

      // Attempt to generate photo asynchronously
      if (filters.generateEmployment !== undefined) {
        // (filters.generateEmployment is just a hint for display, handled in profile)
      }
      await attemptPhotoGeneration(currentProfile);
    } catch (err) {
      showToast("Error generating profile: " + err.message, "error");
      console.error(err);
    } finally {
      isGenerating = false;
      setGenerateButtonState(false);
    }
  }

  // ── Regenerate Photo Only ───────────────────────────────────
  async function handleRegenPhoto() {
    if (!currentProfile) {
      showToast("Generate a profile first.", "error");
      return;
    }
    if (isGenerating) return;

    isGenerating = true;
    showPhotoLoading();

    try {
      await attemptPhotoGeneration(currentProfile);
    } finally {
      isGenerating = false;
      hidePhotoLoading();
    }
  }

  // ── Photo generation attempt ────────────────────────────────
  async function attemptPhotoGeneration(profile) {
    const apiKey = localStorage.getItem("gemini_api_key") || "";
    if (!apiKey) {
      // No key — silently use placeholder (already shown)
      return;
    }

    showPhotoLoading();
    try {
      const photoSrc = await generateHeadshot(apiKey, profile);
      if (photoSrc) {
        currentPhotoSrc = photoSrc;
        updateProfilePhoto(photoSrc);
      }
    } catch (err) {
      showToast("Could not generate photo. Using placeholder.", "error");
      console.warn("Headshot generation failed:", err.message);
      updateProfilePhoto(getPlaceholderSVG(profile.gender));
    } finally {
      hidePhotoLoading();
    }
  }

  // ── Read Filters ────────────────────────────────────────────
  function readFilters() {
    const gender = document.querySelector('input[name="gender"]:checked')?.value || "Any";
    const country = document.getElementById("country-select").value;
    const state = document.getElementById("state-select").value;
    const ageMode = document.querySelector('input[name="age-mode"]:checked')?.value || "range";
    const exactAge = document.getElementById("exact-age").value;
    const minAge = document.getElementById("min-age").value;
    const maxAge = document.getElementById("max-age").value;
    const generateEmployment = document.getElementById("toggle-employment").checked;
    const extendedHobbies = document.getElementById("toggle-hobbies").checked;

    return { gender, country, state, ageMode, exactAge, minAge, maxAge, generateEmployment, extendedHobbies };
  }

  // ── Validate Filters ────────────────────────────────────────
  function validateFilters(filters) {
    if (!filters.country) {
      showToast("Please select a country.", "error");
      document.getElementById("country-select").focus();
      return false;
    }
    if (filters.ageMode === "exact") {
      const a = parseInt(filters.exactAge, 10);
      if (isNaN(a) || a < 5 || a > 100) {
        showToast("Please enter a valid exact age (5–100).", "error");
        document.getElementById("exact-age").focus();
        return false;
      }
    } else {
      const lo = parseInt(filters.minAge, 10) || 0;
      const hi = parseInt(filters.maxAge, 10) || 0;
      if (lo > hi) {
        showToast("Min age cannot be greater than max age.", "error");
        return false;
      }
    }
    return true;
  }

  // ── UI State ────────────────────────────────────────────────
  function setGenerateButtonState(loading) {
    const btn = document.getElementById("generate-btn");
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Generating…" : "Generate Profile";
    if (loading) btn.classList.add("loading");
    else btn.classList.remove("loading");
  }

  // ── Age Toggle ──────────────────────────────────────────────
  function initAgeToggle() {
    const radios = document.querySelectorAll('input[name="age-mode"]');
    radios.forEach(r => r.addEventListener("change", updateAgeMode));
    updateAgeMode();
  }

  function updateAgeMode() {
    const mode = document.querySelector('input[name="age-mode"]:checked')?.value || "range";
    document.getElementById("exact-age-group").style.display = mode === "exact" ? "block" : "none";
    document.getElementById("range-age-group").style.display = mode === "range" ? "flex" : "none";
  }

  // ── Filters Accordion ───────────────────────────────────────
  function initAccordion() {
    const toggle = document.getElementById("filters-toggle");
    const body = document.getElementById("filters-body");
    if (!toggle || !body) return;
    toggle.addEventListener("click", () => {
      const isOpen = body.classList.toggle("filters-open");
      toggle.setAttribute("aria-expanded", isOpen);
      toggle.querySelector(".chevron").style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
    });
    // Open by default
    body.classList.add("filters-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector(".chevron").style.transform = "rotate(180deg)";
  }

  // ── Settings Modal ──────────────────────────────────────────
  function openSettings() {
    document.getElementById("settings-modal").classList.add("modal-open");
    document.getElementById("settings-overlay").classList.add("modal-open");
    document.getElementById("api-key-input").focus();
  }

  function closeSettings() {
    document.getElementById("settings-modal").classList.remove("modal-open");
    document.getElementById("settings-overlay").classList.remove("modal-open");
  }

  function saveApiKey() {
    const key = document.getElementById("api-key-input").value.trim();
    if (key) {
      localStorage.setItem("gemini_api_key", key);
      showToast("API key saved.", "success");
      closeSettings();
    } else {
      showToast("Please enter an API key.", "error");
    }
  }

  function clearApiKey() {
    localStorage.removeItem("gemini_api_key");
    document.getElementById("api-key-input").value = "";
    showToast("API key cleared.", "info");
  }

  function restoreApiKey() {
    const key = localStorage.getItem("gemini_api_key") || "";
    const input = document.getElementById("api-key-input");
    if (input) input.value = key;

    // Show masked key in settings if present
    const indicator = document.getElementById("api-key-indicator");
    if (indicator) {
      indicator.textContent = key ? "✓ API key stored" : "No API key set";
      indicator.className = key ? "key-indicator key-set" : "key-indicator key-unset";
    }
  }
})();
