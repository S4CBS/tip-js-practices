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
  return tasks.filter((task) => !task.completed);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    pending,
    progress,
  };
}

export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) {
    return created;
  }

  if (tasks.some((task) => task.id === id)) {
    return {
      ok: false,
      error: `Задача с идентификатором ${id} уже существует.`,
    };
  }

  return {
    ok: true,
    tasks: [...tasks, created.task],
  };
}

export function setTaskCompleted(tasks, id, completed) {
  if (typeof completed !== "boolean") {
    return {
      ok: false,
      error: "Статус выполнения должен быть логическим значением (true или false).",
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
  if (!isValidTitle(title)) {
    return {
      ok: false,
      error: "Новое название задачи должно быть строкой длиной от 1 до 100 символов после обрезки пробелов.",
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
  const taskExists = tasks.some((task) => task.id === id);
  if (!taskExists) {
    return {
      ok: false,
      error: `Задача с идентификатором ${id} не найдена.`,
    };
  }

  const updatedTasks = tasks.filter((task) => task.id !== id);

  return {
    ok: true,
    tasks: updatedTasks,
  };
}

export function updateTask(tasks, id, title, priority) {
  if (!isPositiveSafeInteger(id)) {
    return {
      ok: false,
      error: "Идентификатор задачи должен быть положительным целым числом.",
    };
  }

  const task = findTaskById(tasks, id);
  if (!task) {
    return {
      ok: false,
      error: `Задача с id ${id} не найдена.`,
    };
  }

  if (!isValidTitle(title)) {
    return {
      ok: false,
      error: "Название задачи должно быть строкой от 1 до 100 символов.",
    };
  }

  if (!ALLOWED_PRIORITIES.has(priority)) {
    return {
      ok: false,
      error: "Приоритет должен принимать значение low, medium или high.",
    };
  }

  const updatedTasks = tasks.map((t) => {
    if (t.id === id) {
      return { ...t, title: title.trim(), priority };
    }
    return t;
  });

  return {
    ok: true,
    tasks: updatedTasks,
  };
}
