
const express = require("express");

function createTasksRouter(service) {
  const router = express.Router();
  const idempotencyStore = new Map();

  function sendError(res, status, code, message, field) {
    return res.status(status).json({
      error: status === 404 ? "NotFoundError" : "ValidationError",
      code,
      details: field ? [{ field, message }] : [],
      requestId: res.req.requestId
    });
  }

  function handle(handler) {
    return (req, res) => {
      try {
        handler(req, res);
      } catch (error) {
        if (error.code) {
          return sendError(
            res, 400, error.code, error.message, error.field, 
          );
        }

        console.error(error);
        return res.status(500).json({
          error: "InternalError",
          code: "INTERNAL_ERROR",
          details: [],
          requestId: req.requestId
        });
      }
    };
  }

  function readId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  // Список завдань
  router.get("/", handle((req, res) => {
    res.json(service.list());
  }));


router.post("/", handle((req, res) => {
  const key = req.get("Idempotency-Key");

  if (!key) {
    return res.status(400).json({
      error: "ValidationError",
      code: "IDEMPOTENCY_KEY_REQUIRED",
      details: [],
      requestId: req.requestId
    });
  }

  const payload = JSON.stringify(req.body);
  const previous = idempotencyStore.get(key);

  // Запит із таким ключем уже виконувався
  if (previous) {
    if (previous.payload !== payload) {
      return res.status(409).json({
        error: "ConflictError",
        code: "IDEMPOTENCY_KEY_CONFLICT",
        details: [],
        requestId: req.requestId
      });
    }

    return res.status(201).json(previous.task);
  }

  // Новий запит
  const task = service.create(req.body);

  idempotencyStore.set(key, {
    payload,
    task
  });

  res.status(201).json(task);
}));


  // Отримання за ID
  router.get("/:id", handle((req, res) => {
    const id = readId(req.params.id);
    const task = id === null ? null : service.get(id);

    if (!task) {
      return sendError(res, 404, "TASK_NOT_FOUND");
    }

    res.json(task);
  }));

  // Редагування
  router.patch("/:id", handle((req, res) => {
    const id = readId(req.params.id);
    const task = id === null
      ? null
      : service.update(id, req.body);

    if (!task) {
      return sendError(res, 404, "TASK_NOT_FOUND");
    }

    res.json(task);
  }));

  // Видалення
  router.delete("/:id", handle((req, res) => {
    const id = readId(req.params.id);
    const deleted = id === null ? false : service.remove(id);

    if (!deleted) {
      return sendError(res, 404, "TASK_NOT_FOUND");
    }

    res.status(204).end();
  }));

  return router;
}

module.exports = createTasksRouter;
