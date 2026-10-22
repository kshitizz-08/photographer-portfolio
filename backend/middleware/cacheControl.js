/**
 * middleware/cacheControl.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP Cache-Control header helpers for public (unauthenticated) read-only API routes.
 *
 * Rationale:
 * - Portfolio photos, galleries, services, and the photographer profile change
 *   infrequently. Allowing browsers and CDN edge caches to cache them for a
 *   short window dramatically reduces round-trips and backend DB queries.
 * - Admin and mutation routes must NEVER be cached — use noCache() there.
 * - stale-while-revalidate lets the browser serve a stale copy while silently
 *   fetching a fresh one in the background, giving instant perceived loading.
 *
 * Usage:
 *   router.get('/photos', shortCache, getPhotos);
 *   router.post('/inquiries', noCache, submitInquiry);
 */

/**
 * Short cache (60 seconds max-age, 300 seconds stale-while-revalidate).
 * Use for content that may change in the course of a few minutes:
 * portfolio photos, galleries (admin updates propagate within ~1 minute).
 */
export function shortCache(req, res, next) {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
}

/**
 * Medium cache (5 minutes max-age, 600 seconds stale-while-revalidate).
 * Use for content that rarely changes: services, photographer profile.
 */
export function mediumCache(req, res, next) {
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  next();
}

/**
 * Explicitly disables caching.
 * MUST be used on all admin, authenticated, and mutation (POST/PUT/PATCH/DELETE) routes.
 */
export function noCache(req, res, next) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}
