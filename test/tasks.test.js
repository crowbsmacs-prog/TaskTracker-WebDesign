
const test = require("node:test");
const assert = require("node:assert/strict");
const Database = require("better-sqlite3");
const createTaskService = require("../service/tasks");

// Перевірка основних операцій із завданнями
test("CRUD works correctly", () => {
  const db = new Database(":memory:");

  try {
    const service = createTaskService(db);

    const task = service.create({
      title: "Практична 4"
    });

    assert.equal(task.title, "Практична 4");
    assert.equal(task.status, "pending");

    const found = service.get(task.id);
    assert.equal(found.id, task.id);

    const updated = service.update(task.id, {
      status: "done"
    });

    assert.equal(updated.status, "done");

    assert.equal(service.remove(task.id), true);
    assert.equal(service.get(task.id), null);
  } finally {
    db.close();
  }
});

// Перевірка некоректної назви завдання
test("Empty title is rejected", () => {
  const db = new Database(":memory:");

  try {
    const service = createTaskService(db);

    assert.throws(
      () => service.create({ title: "   " }),
      (error) => error.code === "TITLE_REQUIRED"
    );
  } finally {
    db.close();
  }
});
