/**
 * middleware/validate.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs express-validator's `validationResult` and short-circuits the request
 * with a structured 422 response if any validation errors exist.
 *
 * Usage (in a route file):
 *   import { runValidation } from "../middleware/validate.js";
 *   router.post("/", [...validators], runValidation, controllerFn);
 */

import { validationResult } from "express-validator";

/**
 * Middleware — aborts request with 422 + field-level errors if validation fails.
 */
export function runValidation(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed. Please check your input.",
      errors:  errors.array().map((e) => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  }

  next();
}
