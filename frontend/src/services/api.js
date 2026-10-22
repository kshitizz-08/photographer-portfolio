/**
 * services/api.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized API client for communicating with the Express backend.
 * Uses import.meta.env.VITE_API_URL with a sensible local fallback.
 */

function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (!envUrl) return "http://localhost:5000/api";
  const clean = envUrl.replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

const API_BASE_URL = getApiBaseUrl();

// 45s allows Render free-tier containers sufficient time to spin up and connect to MongoDB
const DEFAULT_TIMEOUT_MS = 45000;

class ApiError extends Error {
  constructor(message, status, code = null, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.isDbError = status === 503 || code === "DATABASE_UNAVAILABLE";
    this.isTimeout = code === "TIMEOUT";
    this.isColdStart =
      status === 502 ||
      status === 503 ||
      status === 504 ||
      code === "TIMEOUT" ||
      code === "NETWORK_ERROR";

    // User-facing friendly message
    if (this.isColdStart) {
      this.friendlyMessage =
        "The server is waking up from an idle period (Render free-tier cold start typically takes ~30–50 seconds). Please try again in a few moments.";
    } else if (this.isDbError) {
      this.friendlyMessage =
        "Database is temporarily unavailable. Please verify the connection or try again shortly.";
    } else {
      this.friendlyMessage = message;
    }
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Allow caller to pass an existing abort signal
  if (options.signal) {
    options.signal.addEventListener("abort", () => controller.abort());
  }

  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("photographer_admin_token") : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const fetchOptions = {
      credentials: "include",          // send HTTP-only cookies cross-origin
      headers,
      ...options,
      signal: controller.signal,
    };
    delete fetchOptions.timeout;       // avoid leaking custom options to fetch

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        (response.status === 503
          ? "Database is temporarily unavailable or connecting."
          : response.status === 502 || response.status === 504
          ? "Server gateway timeout. The backend may be spinning up."
          : `Request failed with status ${response.status}`);

      throw new ApiError(errorMessage, response.status, data?.code, data);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;

    if (err.name === "AbortError") {
      throw new ApiError(
        "Request timed out while waiting for the server. The backend may still be starting up.",
        504,
        "TIMEOUT"
      );
    }

    // Network errors (backend sleeping, network drop, or server unreachable)
    throw new ApiError(
      "Unable to reach the photography API server. It may be waking up from an idle period.",
      0,
      "NETWORK_ERROR"
    );
  }
}

// ── Portfolio & Photos ───────────────────────────────────────────────────────
export async function getPortfolioPhotos({ category, featured, page = 1, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  if (featured !== undefined) params.append("featured", String(featured));
  if (page) params.append("page", String(page));
  if (limit) params.append("limit", String(limit));

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await request(`/portfolio${query}`);
  return data;
}

export async function getFeaturedPortfolioPhotos() {
  const data = await request("/portfolio/featured");
  return data.photos || [];
}

export async function getPortfolioPhotoById(id) {
  const data = await request(`/portfolio/${id}`);
  return data.photo;
}

// ── Galleries ────────────────────────────────────────────────────────────────
export async function getGalleries({ category } = {}) {
  const query = category && category !== "All" ? `?category=${encodeURIComponent(category)}` : "";
  const data = await request(`/galleries${query}`);
  return data.galleries || [];
}

export async function getGalleryBySlug(slug) {
  const data = await request(`/galleries/${encodeURIComponent(slug)}`);
  return data.gallery;
}

// ── Services ─────────────────────────────────────────────────────────────────
export async function getServices() {
  const data = await request("/services");
  return data.services || [];
}

// ── Photographer Profile ─────────────────────────────────────────────────────
export async function getPhotographerProfile() {
  const data = await request(`/photographer?_t=${Date.now()}`, { cache: "no-store" });
  return data.photographer;
}

// ── Inquiries ────────────────────────────────────────────────────────────────
export async function submitInquiry(payload) {
  return request("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Health Check ─────────────────────────────────────────────────────────────
export async function checkApiHealth() {
  return request("/health");
}

// ── Admin Auth ────────────────────────────────────────────────────────────────
/**
 * POST /api/admin/login
 * Authenticates the photographer and sets an HTTP-only session cookie.
 */
export async function adminLogin(email, password) {
  const data = await request("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.token && typeof window !== "undefined") {
    localStorage.setItem("photographer_admin_token", data.token);
  }
  return data;
}

/**
 * POST /api/admin/logout
 * Clears the admin session cookie and local token.
 */
export async function adminLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("photographer_admin_token");
  }
  return request("/admin/logout", { method: "POST" });
}

/**
 * GET /api/admin/me
 * Returns the currently authenticated photographer if the session cookie is valid.
 * Throws ApiError(401) if not authenticated.
 */
export async function getAdminMe() {
  return request("/admin/me");
}

// ── Admin Content Management (Authenticated) ────────────────────────────────

export async function getAdminStats() {
  return request("/admin/stats");
}

// Portfolio
export async function getAdminPortfolio({ category, search, featured, published } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);
  if (search) params.append("search", search);
  if (featured !== undefined && featured !== "") params.append("featured", String(featured));
  if (published !== undefined && published !== "") params.append("published", String(published));
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/admin/portfolio${query}`);
}

export async function createAdminPhoto(data) {
  return request("/admin/portfolio", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminPhoto(id, data) {
  return request(`/admin/portfolio/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminPhoto(id) {
  return request(`/admin/portfolio/${id}`, {
    method: "DELETE",
  });
}

export async function togglePublishPhoto(id) {
  return request(`/admin/portfolio/${id}/publish`, {
    method: "PATCH",
  });
}

export async function toggleFeaturedPhoto(id) {
  return request(`/admin/portfolio/${id}/featured`, {
    method: "PATCH",
  });
}

export async function reorderAdminPhotos(photoIds) {
  return request("/admin/portfolio/reorder", {
    method: "PUT",
    body: JSON.stringify({ photoIds }),
  });
}

// Galleries
export async function getAdminGalleries() {
  return request("/admin/galleries");
}

export async function getAdminGalleryById(id) {
  return request(`/admin/galleries/${id}`);
}

export async function createAdminGallery(data) {
  return request("/admin/galleries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminGallery(id, data) {
  return request(`/admin/galleries/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminGallery(id) {
  return request(`/admin/galleries/${id}`, {
    method: "DELETE",
  });
}

export async function togglePublishGallery(id) {
  return request(`/admin/galleries/${id}/publish`, {
    method: "PATCH",
  });
}

// Services
export async function getAdminServices() {
  return request("/admin/services");
}

export async function createAdminService(data) {
  return request("/admin/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminService(id, data) {
  return request(`/admin/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminService(id) {
  return request(`/admin/services/${id}`, {
    method: "DELETE",
  });
}

export async function togglePublishService(id) {
  return request(`/admin/services/${id}/publish`, {
    method: "PATCH",
  });
}

// Inquiries
export async function getAdminInquiries({ status, search } = {}) {
  const params = new URLSearchParams();
  if (status && status !== "all") params.append("status", status);
  if (search) params.append("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";
  return request(`/admin/inquiries${query}`);
}

export async function updateAdminInquiry(id, data) {
  return request(`/admin/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminInquiry(id) {
  return request(`/admin/inquiries/${id}`, {
    method: "DELETE",
  });
}

// Profile & Settings
export async function getAdminProfile() {
  return request("/admin/profile");
}

export async function updateAdminProfile(data) {
  return request("/admin/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export { API_BASE_URL, ApiError };

