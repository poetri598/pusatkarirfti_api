import rateLimit from "express-rate-limit";

export default function buildRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // limit each IP
    standardHeaders: true, // RateLimit-* headers
    legacyHeaders: false,
    message: {
      status: "fail",
      code: 429,
      message: "Too many requests, please try again later.",
    },
  });
}
