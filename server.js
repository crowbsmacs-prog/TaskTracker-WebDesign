
const express = require("express");
const Database = require("better-sqlite3");
const path = require("node:path");

const app = express();
const PORT = 3000;

// Підключення до бази даних SQLite
const db = new Database(path.join(__dirname, "tasktracker.db"));

// Створення таблиці
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

// Додавання початкових завдань
const count = db.prepare("SELECT COUNT(*) AS total FROM items").get();

if (count.total === 0) {
  const insert = db.prepare("INSERT INTO items (name) VALUES (?)");

  insert.run("Вивчити основи HTML");
  insert.run("Виконати практичну роботу №1");
  insert.run("Створити GitHub-репозиторій");
  insert.run("Підготувати звіт");
}

// Підключення HTML-сторінки
app.use(express.static(path.join(__dirname, "public")));

// API для отримання завдань із бази
app.get("/items", (req, res) => {
  const items = db.prepare("SELECT id, name FROM items").all();
  res.json(items);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
