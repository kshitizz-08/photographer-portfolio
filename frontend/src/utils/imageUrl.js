
/**
 * utils/imageUrl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Image URL resolver and validator.
 * Accepts any valid HTTP/HTTPS image URL from any website or image host.
 * Recognizes and converts supported sharing URLs (e.g. Google Drive, Dropbox, Imgur)
 * into direct displayable image URLs.
 * Rejects dangerous or unsupported schemes (javascript:, data:, etc.).
 * Preserves query parameters and direct image URLs without unnecessary changes.
 */

/**
 * Validates whether a given string is a safe, syntactically valid HTTP/HTTPS URL.
 * @param {string} url
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "Image URL cannot be empty." };
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: "Image URL cannot be empty." };
  }

  const lower = trimmed.toLowerCase();

  // Reject unsupported / dangerous URL schemes
  if (lower.startsWith("javascript:")) {
    return {
      valid: false,
      error: "The javascript: scheme is not supported for security reasons.",
    };
  }
  if (lower.startsWith("data:")) {
    return {
      valid: false,
      error: "The data: URL scheme is not supported. Please provide a publicly accessible HTTP or HTTPS link.",
    };
  }
  if (
    lower.startsWith("blob:") ||
    lower.startsWith("file:") ||
    lower.startsWith("ftp:")
  ) {
    return {
      valid: false,
      error: "Unsupported URL protocol. Only HTTP and HTTPS URLs are accepted.",
    };
  }

  // Verify valid URL structure
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "Please enter a valid, complete web URL (e.g. https://...)",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      valid: false,
      error: "Only HTTP and HTTPS URLs are allowed.",
    };
  }

  // Check for common sharing page formats that cannot be embedded directly
  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;

  // Imgur albums / galleries
  if (
    hostname.includes("imgur.com") &&
    (pathname.startsWith("/a/") || pathname.startsWith("/gallery/"))
  ) {
    return {
      valid: false,
      error:
        "Imgur album or gallery links cannot be directly embedded. Please open the specific photo, right-click, and copy the direct image link (or use the individual photo link).",
    };
  }

  // Google Photos sharing/album link (not a direct image address)
  if (
    (hostname === "photos.google.com" ||
      hostname.endsWith(".photos.google.com") ||
      hostname === "photos.app.goo.gl") &&
    !hostname.includes("googleusercontent.com")
  ) {
    return {
      valid: false,
      error:
        "Google Photos album links cannot be embedded directly. Please open the photo in Google Photos, right-click, and select 'Copy image address', or use a Google Drive share link.",
    };
  }

  return { valid: true };
}

/**
 * Extracts Google Drive file ID if the URL is a recognized Google Drive link.
 * @param {URL} parsed
 * @returns {string|null}
 */
export function extractGoogleDriveFileId(parsed) {
  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname.includes("drive.google.com") &&
    !hostname.includes("docs.google.com")
  ) {
    return null;
  }

  // Pattern 1: /file/d/{fileId}
  const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }

  // Pattern 2: ?id={fileId} (e.g. open?id=... or uc?id=...)
  const idParam = parsed.searchParams.get("id");
  if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) {
    return idParam;
  }

  // Pattern 3: /d/{fileId}
  const dMatch = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  return null;
}

/**
 * Converts a valid image or sharing URL into a directly usable image URL.
 * If the URL is already a direct link or unrecognized, it is returned without unnecessary modification.
 * @param {string} rawUrl
 * @returns {string}
 */
export function resolveImageUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return "";

  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  // Reject unsupported schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("blob:") ||
    lower.startsWith("file:") ||
    lower.startsWith("ftp:")
  ) {
    return "";
  }

  // Allow relative local asset paths (e.g. /favicon.svg or local mock files)
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "";
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. Google Drive conversion
  const driveFileId = extractGoogleDriveFileId(parsed);
  if (driveFileId) {
    // sz=w2000 requests the full high-resolution image through the Google Drive content API
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w2000`;
  }

  // 2. Dropbox sharing conversion
  if (hostname.includes("dropbox.com")) {
    try {
      const dropUrl = new URL(trimmed);
      dropUrl.searchParams.set("raw", "1");
      dropUrl.searchParams.delete("dl");
      return dropUrl.toString();
    } catch {
      return trimmed;
    }
  }

  // 3. Imgur single-image page conversion (e.g. https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.jpg)
  if (hostname === "imgur.com" || hostname === "www.imgur.com") {
    const match = parsed.pathname.match(/^\/([a-zA-Z0-9]+)$/);
    if (
      match &&
      match[1] &&
      !["gallery", "a", "signin", "upload", "about", "tos"].includes(match[1])
    ) {
      return `https://i.imgur.com/${match[1]}.jpg`;
    }
  }

  // 4. Default: return direct URL preserving query params, protocols, and extensions
  return trimmed;
}

/**
 * Elegant SVG placeholder data URI for graceful fallback when an image cannot be loaded.
 */
export const FALLBACK_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none">
  <rect width="600" height="400" fill="#1C1C1C"/>
  <rect x="1" y="1" width="598" height="398" stroke="#333333" stroke-width="2"/>
  <circle cx="300" cy="180" r="40" stroke="#C4A882" stroke-width="2" opacity="0.6"/>
  <circle cx="315" cy="165" r="8" fill="#C4A882" opacity="0.6"/>
  <path d="M240 260 L280 210 L310 245 L345 200 L370 235 L380 260 Z" fill="#C4A882" opacity="0.4"/>
  <text x="300" y="300" font-family="sans-serif" font-size="14" fill="#888888" text-anchor="middle" letter-spacing="1">IMAGE UNAVAILABLE</text>
</svg>
`);
