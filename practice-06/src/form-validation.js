const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function isPositiveSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function validateTaskDraft(draft, categories) {
  const errors = {};
  const value = {};

  // 1. Title
  const trimmedTitle = typeof draft?.title === "string" ? draft.title.trim() : "";
  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    errors.title = "Название задачи должно содержать от 1 до 100 символов.";
  } else {
    value.title = trimmedTitle;
  }

  // 2. Priority
  const priority = draft?.priority;
  if (!ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Приоритет должен принимать значение low, medium или high.";
  } else {
    value.priority = priority;
  }

  // 3. CategoryId
  const rawCatId = draft?.categoryId;
  let catId = NaN;
  if (typeof rawCatId === "number") {
    catId = rawCatId;
  } else if (typeof rawCatId === "string" && /^\s*\d+\s*$/.test(rawCatId)) {
    catId = Number(rawCatId.trim());
  }

  const categoryExists = Array.isArray(categories) && categories.some((c) => c.id === catId);
  if (!isPositiveSafeInteger(catId) || !categoryExists) {
    errors.categoryId = "Выберите существующую категорию.";
  } else {
    value.categoryId = catId;
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    value,
    errors,
  };
}
