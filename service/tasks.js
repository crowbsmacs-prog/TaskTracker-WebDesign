
const { validateTaskTitle } = require("./validation");

function createTaskService(db) {
  // Окрема таблиця для завдань із CRUD
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    )
  `);

  const findById = db.prepare(
    "SELECT id, title, status FROM tasks WHERE id = ?"
  );

  function checkTitle(title) {
    const result = validateTaskTitle(title);

    if (!result.valid) {
      const error = new Error(result.message);
      error.code = "TITLE_REQUIRED";
      error.field = "title";
      throw error;
    }

    return result.title;
  }

  function validationError(message, code, field) {
    const error = new Error(message);
    error.code = code;
    error.field = field;
    throw error;
  }

  return {
    // Отримати всі завдання
    list() {
      return db.prepare(
        "SELECT id, title, status FROM tasks ORDER BY id"
      ).all();
    },

    // Отримати одне завдання
    get(id) {
      return findById.get(id) || null;
    },

    // Створити завдання
    create(data = {}) {
      const title = checkTitle(data?.title);

      const result = db.prepare(
        "INSERT INTO tasks (title) VALUES (?)"
      ).run(title);

      return findById.get(result.lastInsertRowid);
    },

    // Оновити завдання
    update(id, changes = {}) {
      const task = findById.get(id);
      if (!task) return null;

      if (!changes || typeof changes !== "object" ||
          Array.isArray(changes)) {
        validationError("Некоректні дані", "INVALID_INPUT", "body");
      }

      const hasTitle = Object.hasOwn(changes, "title");
      const hasStatus = Object.hasOwn(changes, "status");

      if (!hasTitle && !hasStatus) {
        validationError(
          "Немає даних для оновлення",
          "EMPTY_UPDATE",
          "body"
        );
      }

      const title = hasTitle
        ? checkTitle(changes.title)
        : task.title;

      const status = hasStatus
        ? changes.status
        : task.status;

      if (!["pending", "in_progress", "done"].includes(status)) {
        validationError(
          "Невідомий статус",
          "INVALID_STATUS",
          "status"
        );
      }

      db.prepare(
        "UPDATE tasks SET title = ?, status = ? WHERE id = ?"
      ).run(title, status, id);

      return findById.get(id);
    },

    // Видалити завдання
    remove(id) {
      const result = db.prepare(
        "DELETE FROM tasks WHERE id = ?"
      ).run(id);

      return result.changes > 0;
    }
  };
}

module.exports = createTaskService;
