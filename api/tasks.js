
const express = require("express");

function createTasksRouter(service) {
  const router = express.Router();

  function sendError(res, status, code, message, field) {
    return res.status(status).json({
      error: status === 404 ? "NotFoundError" : "ValidationError",
      code,
      details: field ? [{ field, message }] : []
    });
  }

  function handle(handler) {
    return (req, res) => {
      try {
        handler(req, res);
      } catch (error) {
        if (error.code) {
          return sendError(
            res, 400, error.code, error.message, error.field
          );
        }

        console.error(error);
        return res.status(500).json({
          error: "InternalError",
          code: "INTERNAL_ERROR",
          details: []
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

  // Створення завдання
  router.post("/", handle((req, res) => {
    const task = service.create(req.body);
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
