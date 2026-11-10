
const express = require("express");
const Database = require("better-sqlite3");
const path = require("node:path");

const createTasksRouter = require("./api/tasks");
const createTaskService = require("./service/tasks");

const app = express();
const PORT = 3000;

// Підключення бази даних
const db = new Database(path.join(__dirname, "tasktracker.db"));

// Налаштування сервера
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Таблиця з першої практичної
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

// Початкові завдання
const count = db.prepare(
  "SELECT COUNT(*) AS total FROM items"
).get();

if (count.total === 0) {
  const insert = db.prepare(
    "INSERT INTO items (name) VALUES (?)"
  );

  insert.run("Вивчити основи HTML");
  insert.run("Виконати практичну роботу №1");
  insert.run("Створити GitHub-репозиторій");
  insert.run("Підготувати звіт");
}

// Перевірка роботи сервера
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API першої практичної
app.get("/items", (req, res) => {
  const items = db.prepare(
    "SELECT id, name FROM items"
  ).all();

  res.json(items);
});

// API четвертої практичної
const tasksService = createTaskService(db);
app.use("/tasks", createTasksRouter(tasksService));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
