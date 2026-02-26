/**
 * headshotGenerator.js — Gemini API headshot generation with fallback
 */

/**
 * Generate a headshot using the Gemini API.
 * @param {string} apiKey — Gemini API key
 * @param {object} profile — profile data for prompt construction
 * @returns {Promise<string>} — base64 data URL or null on failure
 */
async function generateHeadshot(apiKey, profile) {
  if (!apiKey) return null;

  const { age, gender, address } = profile;
  const countryName = address.country;
  const ethnicity = profile.ethnicity || "";
  const genderStr = gender === "Any" ? "person" : gender.toLowerCase();

  const prompt = `Professional studio headshot photo of a ${age}-year-old ${genderStr}${ethnicity ? ` with ${ethnicity} appearance` : ""} from ${countryName}. Neutral light grey background, soft professional lighting, face centered and in focus, shoulders visible, friendly natural expression. No text, no watermarks, no logos, no overlays. Photorealistic, high quality portrait photography.`;

  // Gemini image generation endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE", "TEXT"],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Extract base64 image from response
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      const mimeType = part.inlineData.mimeType;
      const b64 = part.inlineData.data;
      return `data:${mimeType};base64,${b64}`;
    }
  }

  throw new Error("No image returned by Gemini API");
}

/**
 * Returns an inline SVG placeholder silhouette as a data URL.
 * @param {string} gender — "Male" | "Female" | "Any"
 * @returns {string} SVG data URL
 */
function getPlaceholderSVG(gender) {
  const isFemale = gender === "Female";
  // Simple gender-appropriate silhouette
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#d1d5db;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#9ca3af;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="silhouette" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6b7280;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4b5563;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg)" rx="8"/>
  <!-- Head -->
  <circle cx="100" cy="72" r="${isFemale ? 32 : 30}" fill="url(#silhouette)"/>
  <!-- Body -->
  ${isFemale
    ? `<path d="M50 200 Q50 140 100 130 Q150 140 150 200 Z" fill="url(#silhouette)"/>`
    : `<path d="M45 200 Q48 138 100 128 Q152 138 155 200 Z" fill="url(#silhouette)"/>`
  }
  <!-- Subtle icon hint -->
  <text x="100" y="175" text-anchor="middle" fill="#e5e7eb" font-size="11" font-family="sans-serif" opacity="0.6">No Photo</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
