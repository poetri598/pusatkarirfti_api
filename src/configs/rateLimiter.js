import rateLimit from "express-rate-limit";

export default function buildRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "fail",
      code: 429,
      message: "Too many requests, please try again later.",
    },
  });
}
