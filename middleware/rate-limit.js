
const WINDOW_MS = 10000;
const MAX_REQUESTS = 8;

const clients = new Map();

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();

  let state = clients.get(ip);

  // Початок нового часового вікна
  if (!state || now - state.startedAt >= WINDOW_MS) {
    state = {
      startedAt: now,
      count: 0
    };
  }

  state.count++;
  clients.set(ip, state);

  if (state.count > MAX_REQUESTS) {
    const remaining = WINDOW_MS - (now - state.startedAt);
    const retryAfter = Math.max(1, Math.ceil(remaining / 1000));

    res.setHeader("Retry-After", String(retryAfter));

    return res.status(429).json({
      error: "too_many_requests",
      code: "RATE_LIMITED",
      details: [],
      requestId: req.requestId
    });
  }

  next();
}

module.exports = rateLimit;
