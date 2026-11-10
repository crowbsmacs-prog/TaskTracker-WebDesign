// Практична №3: прототип сутностей Domain-Driven Design (DDD).
// Це моделі майбутньої функціональності; їх поки не використовує server.js.

class Task {
  constructor({ id, title, description = "", priority = "normal" }) {
    if (id === undefined || id === null || String(id).trim() === "") {
      throw new Error("Task id is required");
    }
    if (typeof title !== "string" || !title.trim()) {
      throw new Error("Task title is required");
    }
    if (!["low", "normal", "high"].includes(priority)) {
      throw new Error("Invalid task priority");
    }
    this.id = id;
    this.title = title.trim();
    this.description = description;
    this.priority = priority;
    this.status = "todo";
    this.assigneeId = null;
  }

  assignTo(userId) {
    if (userId === undefined || userId === null || !String(userId).trim()) {
      throw new Error("Assignee id is required");
    }
    this.assigneeId = String(userId);
  }

  start() {
    if (this.status === "done") throw new Error("Completed task cannot be restarted");
    this.status = "in_progress";
  }

  complete() {
    this.status = "done";
  }
}

class User {
  constructor({ id, name, role = "student" }) {
    if (!id || typeof name !== "string" || !name.trim()) {
      throw new Error("User id and name are required");
    }
    if (!["student", "teacher"].includes(role)) {
      throw new Error("Invalid role");
    }
    this.id = String(id);
    this.name = name.trim();
    this.role = role;
  }

  canCreateTasks() {
    return this.role === "teacher";
  }
}

class Notification {
  constructor({ id, recipientId, message }) {
    if (!id || !recipientId || typeof message !== "string" || !message.trim()) {
      throw new Error("Notification id, recipient and message are required");
    }
    this.id = String(id);
    this.recipientId = String(recipientId);
    this.message = message.trim();
    this.isRead = false;
  }

  markAsRead() {
    this.isRead = true;
  }
}

module.exports = { Task, User, Notification };
