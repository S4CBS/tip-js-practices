// Модуль логики приложения управления задачами.
// Чистые функции: не мутируют входные массивы и объекты,
// не используют консольный вывод и глобальное состояние.

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function isPositiveSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isValidTitle(title) {
  return typeof title === "string" && title.trim().length >= 1 && title.trim().length <= 100;
}

export function createTask(id, title, priority = "medium") {
  if (!isPositiveSafeInteger(id)) {
    return {
      ok: false,
      error: "Идентификатор задачи должен быть положительным безопасным целым числом.",
    };
  }

  if (!isValidTitle(title)) {
    return {
      ok: false,
      error: "Название задачи должно быть строкой длиной от 1 до 100 символов после обрезки пробелов.",
    };
  }

  const effectivePriority = priority === undefined ? "medium" : priority;
  if (!ALLOWED_PRIORITIES.has(effectivePriority)) {
    return {
      ok: false,
      error: "Приоритет должен принимать одно из значений: 'low', 'medium', 'high'.",
    };
  }

  return {
    ok: true,
    task: {
      id,
      title: title.trim(),
      completed: false,
      priority: effectivePriority,
    },
  };
}

export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const createResult = createTask(id, title, priority);
  if (!createResult.ok) {
    return createResult;
  }

  if (tasks.some((task) => task.id === id)) {
    return {
      ok: false,
      error: `Задача с идентификатором ${id} уже существует в списке.`,
    };
  }

  return {
    ok: true,
    tasks: [...tasks, createResult.task],
  };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!isPositiveSafeInteger(id)) {
    return {
      ok: false,
      error: "Идентификатор задачи должен быть положительным безопасным целым числом.",
    };
  }

  if (typeof completed !== "boolean") {
    return {
      ok: false,
      error: "Статус выполнения должен быть булевым значением (true или false).",
    };
  }

  const taskExists = tasks.some((task) => task.id === id);
  if (!taskExists) {
    return {
      ok: false,
      error: `Задача с идентификатором ${id} не найдена.`,
    };
  }

  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed };
    }
    return task;
  });

  return {
    ok: true,
    tasks: updatedTasks,
  };
}

export function renameTask(tasks, id, title) {
  if (!isPositiveSafeInteger(id)) {
    return {
      ok: false,
      error: "Идентификатор задачи должен быть положительным безопасным целым числом.",
    };
  }

  if (!isValidTitle(title)) {
    return {
      ok: false,
      error: "Название задачи должно быть строкой длиной от 1 до 100 символов после обрезки пробелов.",
    };
  }

  const taskExists = tasks.some((task) => task.id === id);
  if (!taskExists) {
    return {
      ok: false,
      error: `Задача с идентификатором ${id} не найдена.`,
    };
  }

  const updatedTasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, title: title.trim() };
    }
    return task;
  });

  return {
    ok: true,
    tasks: updatedTasks,
  };
}

export function removeTask(tasks, id) {
  if (!isPositiveSafeInteger(id)) {
    return {
      ok: false,
      error: "Идентификатор задачи должен быть положительным безопасным целым числом.",
    };
  }

  const taskExists = tasks.some((task) => task.id === id);
  if (!taskExists) {
    return {
      ok: false,
      error: `Задача с идентификатором ${id} не найдена.`,
    };
  }

  return {
    ok: true,
    tasks: tasks.filter((task) => task.id !== id),
  };
}
