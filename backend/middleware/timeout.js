/**
 * middleware/timeout.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces a strict request execution timeout.
 * Prevents hanging sockets, slow network requests, or database deadlocks from
 * exhausting server resources on free tier hosts like Render.
 */

export function requestTimeout(timeoutMs = 15000) {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: "Gateway timeout: The server took too long to respond.",
          code: "REQUEST_TIMEOUT",
        });
      }
    }, timeoutMs);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    next();
  };
}

export default requestTimeout;
