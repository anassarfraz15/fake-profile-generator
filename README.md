# 🪪 Fake Profile Generator

A responsive, single-page web application that generates random but realistic fake person profiles for testing and demo purposes.

## Features

- **Realistic profiles** — internally consistent data: age ↔ DOB, address ↔ country/state, postal codes, phone numbers
- **Seeded RNG** — same seed + same filters = identical profile every time
- **16 supported countries** with real states/provinces and cities (US, UK, Canada, Australia, India, Germany, France, Japan, Brazil, Mexico, South Korea, Nigeria, South Africa, Pakistan, Italy, Spain)
- **AI headshots** via Gemini API (optional) with placeholder SVG fallback
- **Filter controls** — gender, country, state/province, age (exact or range), employment toggle, extended hobbies toggle
- **Copy to clipboard** for name, email, phone, address, bio
- **Download as JSON** or **PNG** (via html2canvas)
- Mobile-first, fully responsive design

## File Structure

```
index.html               — Single-page application entry point
css/
  styles.css             — All styling (mobile-first, responsive)
js/
  app.js                 — Main controller, event wiring, UI orchestration
  profileGenerator.js    — Core profile generation (seeded PRNG)
  addressGenerator.js    — Country/state-aware address + phone + postal code generation
  employmentGenerator.js — Employment data generation
  bioGenerator.js        — Age-appropriate bio text generation
  headshotGenerator.js   — Gemini API headshot + SVG fallback
  data.js                — All static data (countries, states, names, cities, etc.)
  utils.js               — Clipboard, download (JSON + PNG), seed utilities
  ui.js                  — DOM manipulation, skeleton loaders, section rendering
README.md                — This file
```

## Usage

1. **Open `index.html`** directly in any modern browser — no build step or server required.
2. Configure filters (gender, country, state, age, toggles).
3. Click **Generate Profile**.
4. Use the **Copy** icons to copy individual fields to clipboard.
5. Click **Download JSON** to save the full profile as a JSON file.
6. Click **Download PNG** to screenshot the profile card.
7. Use the **Seed** field to reproduce the exact same profile later.

## Gemini API Key Setup (optional — for AI headshots)

1. Click the **⚙️ gear icon** in the top-right corner.
2. Paste your Gemini API key (get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)).
3. Click **Save Key**.

> 🔒 Your key is stored only in your browser's `localStorage`. It is never sent anywhere except directly to the Gemini API.

Without a key, the app works fully — a silhouette placeholder is used for the profile photo.

## Seed System

Each generated profile has a **numeric seed** displayed below the profile photo. You can:
- Enter a seed manually before generating to reproduce a specific profile.
- Leave the seed blank to get a new random seed each time.
- Same seed + same filter selections = identical profile every time.

## Disclaimer

⚠️ Generated profiles are entirely fictional and intended for testing/educational use only. Any resemblance to real persons is purely coincidental.