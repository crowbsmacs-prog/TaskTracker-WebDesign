
function validateTaskTitle(title) {
  if (typeof title !== "string" || !title.trim()) {
    return {
      valid: false,
      message: "Назва завдання не може бути порожньою"
    };
  }

  return {
    valid: true,
    title: title.trim()
  };
}

module.exports = { validateTaskTitle };
