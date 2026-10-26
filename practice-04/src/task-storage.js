export const STORAGE_VERSION = 1;

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const seenIds = new Set();
  for (const item of value) {
    if (!item || typeof item !== "object") return false;
    if (typeof item.id !== "number" || !Number.isSafeInteger(item.id) || item.id <= 0) return false;
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);

    if (typeof item.title !== "string" || item.title.trim().length < 1 || item.title.trim().length > 100) return false;
    if (typeof item.completed !== "boolean") return false;
    if (!ALLOWED_PRIORITIES.has(item.priority)) return false;
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return {
        ok: true,
        source: "initial",
        tasks: fallbackTasks.map((t) => ({ ...t })),
      };
    }
    const data = JSON.parse(raw);
    if (!data || data.version !== STORAGE_VERSION || !isValidTaskList(data.tasks)) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackTasks.map((t) => ({ ...t })),
        error: "Некорректная структура или версия данных в хранилище.",
      };
    }
    return {
      ok: true,
      source: "storage",
      tasks: data.tasks.map((t) => ({ ...t })),
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackTasks.map((t) => ({ ...t })),
      error: error.message,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  try {
    if (!isValidTaskList(tasks)) {
      return { ok: false, error: "Некорректная структура списка задач." };
    }
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}
