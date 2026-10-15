/**
 * utils/currency.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable Indian Rupee (INR) currency formatting utility.
 * Uses the native Intl.NumberFormat API with en-IN locale for correct
 * Indian numbering (lakhs, crores) and the ₹ symbol.
 *
 * Usage:
 *   formatINR(25000)        → "₹25,000"
 *   formatINR(100000)       → "₹1,00,000"
 *   formatINR(null)         → "Contact for pricing"
 *   formatINRStarting(5000) → "Starting at ₹5,000"
 */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/**
 * Format a numeric amount in Indian Rupees.
 * Returns "Contact for pricing" if the value is null, undefined, or not a
 * finite number.
 *
 * @param {number|null|undefined} amount
 * @returns {string}
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || !isFinite(Number(amount))) {
    return "Contact for pricing";
  }
  return INR_FORMATTER.format(Number(amount));
}

/**
 * Format a numeric amount as a "Starting at ₹X" label for public pages.
 * Returns "Contact for pricing" when no price is set.
 *
 * @param {number|null|undefined} amount
 * @returns {string}
 */
export function formatINRStarting(amount) {
  if (amount === null || amount === undefined || !isFinite(Number(amount))) {
    return "Contact for pricing";
  }
  return `Starting at ${INR_FORMATTER.format(Number(amount))}`;
}

/**
 * Format a numeric amount as a "From ₹X" label for compact preview cards.
 * Returns null when there is no price, so the caller can skip rendering.
 *
 * @param {number|null|undefined} amount
 * @returns {string|null}
 */
export function formatINRFrom(amount) {
  if (amount === null || amount === undefined || !isFinite(Number(amount))) {
    return null;
  }
  return `From ${INR_FORMATTER.format(Number(amount))}`;
}
