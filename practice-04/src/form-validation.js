const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const value = {};

  // 1. Проверка идентификатора id
  if (editingId !== null) {
    const exists = tasks.some((t) => t.id === editingId);
    if (!exists) {
      errors.id = `Задача с id ${editingId} не найдена.`;
    } else {
      value.id = editingId;
    }
  } else {
    const rawId = draft?.id;
    let numId = NaN;

    if (typeof rawId === "number") {
      numId = rawId;
    } else if (typeof rawId === "string" && /^\s*\d+\s*$/.test(rawId)) {
      numId = Number(rawId.trim());
    }

    if (!Number.isSafeInteger(numId) || numId <= 0) {
      errors.id = "Идентификатор должен быть положительным целым числом.";
    } else if (tasks.some((t) => t.id === numId)) {
      errors.id = "Задача с таким идентификатором уже существует.";
    } else {
      value.id = numId;
    }
  }

  // 2. Проверка названия title
  const trimmedTitle = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    errors.title = "Название задачи должно содержать от 1 до 100 символов.";
  } else {
    value.title = trimmedTitle;
  }

  // 3. Проверка приоритета priority
  const priority = draft?.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Приоритет должен принимать значение low, medium или high.";
  } else {
    value.priority = priority;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value };
}
