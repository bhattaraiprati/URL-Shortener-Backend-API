import { Request, Response, NextFunction } from 'express';
import { RateLimitData } from '../types/interfaces';

const rateLimitStore = new Map<string, RateLimitData>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 0, windowStart: now });
  }

  const userData = rateLimitStore.get(ip)!;

  // Reset window if expired
  if (now - userData.windowStart > WINDOW_MS) {
    userData.count = 0;
    userData.windowStart = now;
  }

  if (userData.count >= MAX_REQUESTS) {
    const timeLeft = Math.ceil((userData.windowStart + WINDOW_MS - now) / 1000);

    res.status(429).json({
      success: false,
      message: "Rate limit exceeded. You can only shorten 5 URLs per minute.",
      retryAfter: timeLeft,
      limit: MAX_REQUESTS,
      windowSeconds: WINDOW_MS / 1000
    });
    return;
  }

  userData.count += 1;
  rateLimitStore.set(ip, userData);

  // Periodic cleanup
  if (Math.random() < 0.1) cleanOldEntries();

  next();
};

function cleanOldEntries(): void {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now - data.windowStart > WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}