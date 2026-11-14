
const { randomUUID } = require("node:crypto");

function requestId(req, res, next) {
  const provided = req.get("X-Request-Id");

  const id =
    provided && /^[a-zA-Z0-9._-]{1,128}$/.test(provided)
      ? provided
      : randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-Id", id);

  next();
}

module.exports = requestId;
