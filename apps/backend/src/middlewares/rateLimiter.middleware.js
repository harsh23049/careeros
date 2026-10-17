import ApiError from "../utils/ApiError.js";

/**
 * Creates an in-memory rate limiter middleware for sensitive endpoints.
 * @param {Object} options
 * @param {number} options.windowMs Window in milliseconds (e.g. 15 * 60 * 1000)
 * @param {number} options.maxAttempts Maximum allowed attempts in window
 * @param {string} options.message Error message on limit exceeded
 */
export const createRateLimiter = ({ windowMs, maxAttempts, message }) => {
  const attempts = new Map();

  // Periodically clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of attempts.entries()) {
      if (now > record.resetTime) {
        attempts.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    // Generate key based on IP + endpoint
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";
    const key = `${clientIp}:${req.baseUrl}${req.path}`;
    const now = Date.now();

    const record = attempts.get(key);

    if (!record || now > record.resetTime) {
      attempts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (record.count >= maxAttempts) {
      throw new ApiError(
        429,
        message || "Too many requests. Please try again later."
      );
    }

    record.count += 1;
    next();
  };
};

export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  message: "Too many password reset requests. Please try again in 15 minutes.",
});

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 10,
  message: "Too many login attempts. Please wait 15 minutes before trying again.",
});

export default {
  forgotPasswordLimiter,
  loginLimiter,
};
