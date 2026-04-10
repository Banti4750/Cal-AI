import rateLimit from 'express-rate-limit';

export const llmLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  limit: 7, // 7 requests per day per IP
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});