/**
 * utils/imageUrl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Image URL resolver, optimizer, and validator.
 * - Accepts any valid HTTP/HTTPS image URL from any website or image host.
 * - Generates responsive WebP/AVIF versions with dynamic widths for supported CDNs
 *   (Unsplash, Google Drive / Googleusercontent, Cloudinary).
 * - Bypasses slow 302 redirects for Google Drive images by targeting direct lh3 endpoints.
 * - Preserves arbitrary external direct URLs without invalid query manipulation.
 * - Caches resolved URLs to avoid repeated URL parsing and regex operations.
 */

// In-memory cache for resolved URLs to avoid repeated string & regex operations
const resolvedUrlCache = new Map();

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
        "Imgur album or gallery links cannot be directly embedded. Please open the specific photo, right-click, and copy the direct image link.",
    };
  }

  // Google Photos sharing/album link
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
 * Extracts Google Drive / Google UserContent file ID if present.
 * Supports:
 * - https://drive.google.com/file/d/{id}/view
 * - https://drive.google.com/open?id={id}
 * - https://drive.google.com/thumbnail?id={id}
 * - https://lh3.googleusercontent.com/d/{id}=w...
 * @param {URL} parsed
 * @returns {string|null}
 */
export function extractGoogleDriveFileId(parsed) {
  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname.includes("drive.google.com") &&
    !hostname.includes("docs.google.com") &&
    !hostname.includes("googleusercontent.com")
  ) {
    return null;
  }

  // Pattern 1: /file/d/{fileId}
  const fileMatch = parsed.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }

  // Pattern 2: /d/{fileId} (e.g. lh3.googleusercontent.com/d/{fileId})
  const dMatch = parsed.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) {
    return dMatch[1];
  }

  // Pattern 3: ?id={fileId}
  const idParam = parsed.searchParams.get("id");
  if (idParam && /^[a-zA-Z0-9_-]+$/.test(idParam)) {
    return idParam;
  }

  return null;
}

/**
 * Checks whether an image provider supports server-side dynamic width resizing
 * and format negotiation (WebP/AVIF).
 * @param {string} rawUrl
 * @returns {boolean}
 */
export function supportsDynamicSizing(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase();
    if (host.includes("images.unsplash.com")) return true;
    if (
      host.includes("drive.google.com") ||
      host.includes("docs.google.com") ||
      host.includes("googleusercontent.com")
    ) {
      return true;
    }
    if (host.includes("res.cloudinary.com")) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Converts a valid image or sharing URL into a directly usable, appropriately sized image URL.
 * Automatically serves WebP/AVIF via auto-format parameter on supported CDNs.
 *
 * @param {string} rawUrl - Source image URL
 * @param {object} [options]
 * @param {number} [options.width] - Requested width in pixels (e.g. 400, 800, 1200, 1920)
 * @param {number} [options.quality=80] - Compression quality (1-100)
 * @returns {string} Directly displayable optimized image URL
 */
export function resolveImageUrl(rawUrl, { width, quality = 80 } = {}) {
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

  // Allow local asset paths
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  const cacheKey = `${trimmed}::w=${width || "def"}::q=${quality}`;
  if (resolvedUrlCache.has(cacheKey)) {
    return resolvedUrlCache.get(cacheKey);
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    resolvedUrlCache.set(cacheKey, trimmed);
    return trimmed;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "";
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. Google Drive / Google UserContent
  // Resolves directly to lh3.googleusercontent.com to eliminate the 302 redirect hop,
  // requesting an appropriately sized thumbnail (e.g. w800 instead of default w2000).
  const driveFileId = extractGoogleDriveFileId(parsed);
  if (driveFileId) {
    const targetW = width ? Math.min(Math.max(width, 100), 2560) : 1200;
    const directUrl = `https://lh3.googleusercontent.com/d/${driveFileId}=w${targetW}`;
    resolvedUrlCache.set(cacheKey, directUrl);
    return directUrl;
  }

  // 2. Unsplash
  // Unsplash automatically negotiates WebP or AVIF based on browser Accept headers when auto=format is present.
  if (hostname.includes("images.unsplash.com")) {
    try {
      const u = new URL(trimmed);
      const targetW = width ? Math.min(Math.max(width, 100), 2560) : (u.searchParams.get("w") || "1200");
      u.searchParams.set("w", String(targetW));
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("q", String(quality));
      const result = u.toString();
      resolvedUrlCache.set(cacheKey, result);
      return result;
    } catch {
      resolvedUrlCache.set(cacheKey, trimmed);
      return trimmed;
    }
  }

  // 3. Cloudinary
  if (hostname.includes("res.cloudinary.com") && parsed.pathname.includes("/image/upload/")) {
    const parts = parsed.pathname.split("/image/upload/");
    const targetW = width || 1200;
    const transform = `f_auto,q_auto:good,w_${targetW},c_limit`;
    const result = `${parsed.protocol}//${parsed.host}${parts[0]}/image/upload/${transform}/${parts[1]}`;
    resolvedUrlCache.set(cacheKey, result);
    return result;
  }

  // 4. Dropbox sharing conversion
  if (hostname.includes("dropbox.com")) {
    try {
      const dropUrl = new URL(trimmed);
      dropUrl.searchParams.set("raw", "1");
      dropUrl.searchParams.delete("dl");
      const result = dropUrl.toString();
      resolvedUrlCache.set(cacheKey, result);
      return result;
    } catch {
      resolvedUrlCache.set(cacheKey, trimmed);
      return trimmed;
    }
  }

  // 5. Imgur single-image page conversion
  if (hostname === "imgur.com" || hostname === "www.imgur.com") {
    const match = parsed.pathname.match(/^\/([a-zA-Z0-9]+)$/);
    if (
      match &&
      match[1] &&
      !["gallery", "a", "signin", "upload", "about", "tos"].includes(match[1])
    ) {
      const result = `https://i.imgur.com/${match[1]}.jpg`;
      resolvedUrlCache.set(cacheKey, result);
      return result;
    }
  }

  // 6. Direct / External arbitrary URL: Return untouched to prevent breaking arbitrary servers
  resolvedUrlCache.set(cacheKey, trimmed);
  return trimmed;
}

/**
 * Builds a responsive HTML srcset attribute string for supported image CDNs.
 * Returns an empty string for arbitrary direct URLs where dynamic query parameters
 * are not supported or could break image retrieval.
 *
 * @param {string} rawUrl - Source image URL
 * @param {number[]} [widths=[400, 800, 1200]] - Array of pixel widths to generate
 * @param {object} [options]
 * @param {number} [options.quality=80]
 * @returns {string} Valid srcset string or empty string
 */
export function getResponsiveSrcSet(rawUrl, widths = [400, 800, 1200], { quality = 80 } = {}) {
  if (!supportsDynamicSizing(rawUrl)) {
    return "";
  }

  return widths
    .map((w) => `${resolveImageUrl(rawUrl, { width: w, quality })} ${w}w`)
    .join(", ");
}

/**
 * Standard sizes attribute hints for common layouts.
 */
export const DEFAULT_IMAGE_SIZES = {
  grid: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  hero: "100vw",
  half: "(max-width: 768px) 100vw, 50vw",
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
};

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
