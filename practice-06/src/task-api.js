import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Клиент должен предоставлять метод requestJson.");
  }

  return {
    async getTasks(filters = {}, { signal } = {}) {
      if (!filters || typeof filters !== "object" || Array.isArray(filters)) {
        throw new TypeError("Фильтры должны быть объектом.");
      }

      const query = {};
      for (const [key, val] of Object.entries(filters)) {
        if (!ALLOWED_FILTERS.has(key)) {
          throw new TypeError(`Неизвестный фильтр: ${key}`);
        }
        if (key === "completed") {
          if (typeof val !== "boolean") {
            throw new TypeError("completed должен быть логическим значением.");
          }
          query.completed = val;
        } else if (key === "priority") {
          if (!ALLOWED_PRIORITIES.has(val)) {
            throw new TypeError("Недопустимое значение priority.");
          }
          query.priority = val;
        } else if (key === "categoryId") {
          if (!isPositiveSafeInteger(val)) {
            throw new TypeError("categoryId должен быть положительным целым числом.");
          }
          query.categoryId = val;
        } else if (key === "q") {
          if (typeof val !== "string" || val.length > 100) {
            throw new TypeError("q должен быть строкой длиной не более 100 символов.");
          }
          const trimmed = val.trim();
          if (trimmed.length > 0) {
            query.q = trimmed;
          }
        }
      }

      const response = await client.requestJson("/tasks", { query, signal });
      if (!response || !Array.isArray(response.data)) {
        throw invalidResponse("Ответ /tasks должен содержать массив data.");
      }

      const seenIds = new Set();
      for (const t of response.data) {
        if (!isTask(t)) {
          throw invalidResponse("Задача не соответствует контракту схемы.");
        }
        if (seenIds.has(t.id)) {
          throw invalidResponse("Дублирующийся id задачи в ответе.");
        }
        seenIds.add(t.id);
      }

      if (!response.meta || typeof response.meta.total !== "number" || response.meta.total !== response.data.length) {
        throw invalidResponse("Поле meta.total некорректно.");
      }

      return {
        tasks: response.data,
        meta: response.meta,
      };
    },

    async getTaskById(id, { signal } = {}) {
      if (!isPositiveSafeInteger(id)) {
        throw new TypeError("id должен быть положительным безопасным целым числом.");
      }

      const response = await client.requestJson(`/tasks/${id}`, { signal });
      if (!response || !isTask(response.data)) {
        throw invalidResponse("Задача не найдена или не соответствует схеме.");
      }

      return response.data;
    },

    async getCategories({ signal } = {}) {
      const response = await client.requestJson("/categories", { signal });
      if (!response || !Array.isArray(response.data)) {
        throw invalidResponse("Ответ /categories должен содержать массив data.");
      }

      const seenIds = new Set();
      for (const c of response.data) {
        if (!isCategory(c)) {
          throw invalidResponse("Категория не соответствует схеме.");
        }
        if (seenIds.has(c.id)) {
          throw invalidResponse("Дублирующийся id категории.");
        }
        seenIds.add(c.id);
      }

      return response.data;
    },

    async loadInitialData(filters = {}, { signal } = {}) {
      const tasksPromise = this.getTasks(filters, { signal });
      const categoriesPromise = this.getCategories({ signal });

      const [tasksResult, categories] = await Promise.all([tasksPromise, categoriesPromise]);
      return {
        tasks: tasksResult.tasks,
        categories,
        meta: tasksResult.meta,
      };
    },

    async createTask(draft, { signal } = {}) {
      const response = await client.requestJson("/tasks", {
        method: "POST",
        body: draft,
        signal,
      });

      if (!response || !isTask(response.data)) {
        throw invalidResponse("Ответ создания задачи не соответствует схеме.");
      }

      return response.data;
    },

    async updateTask(id, changes, { signal } = {}) {
      if (!isPositiveSafeInteger(id)) {
        throw new TypeError("id должен быть положительным целым числом.");
      }

      const response = await client.requestJson(`/tasks/${id}`, {
        method: "PATCH",
        body: changes,
        signal,
      });

      if (!response || !isTask(response.data)) {
        throw invalidResponse("Ответ обновления задачи не соответствует схеме.");
      }

      return response.data;
    },

    async setTaskCompleted(id, completed, { signal } = {}) {
      return this.updateTask(id, { completed }, { signal });
    },

    async deleteTask(id, { signal } = {}) {
      if (!isPositiveSafeInteger(id)) {
        throw new TypeError("id должен быть положительным целым числом.");
      }

      const response = await client.requestJson(`/tasks/${id}`, {
        method: "DELETE",
        signal,
      });

      if (response !== null) {
        throw invalidResponse("Ожидался пустой ответ 204 при удалении задачи.");
      }

      return null;
    },

    async resetDemoData({ signal } = {}) {
      const response = await client.requestJson("/debug/reset", {
        method: "POST",
        signal,
      });

      if (!response || !response.data) {
        throw invalidResponse("Ответ сброса данных не соответствует схеме.");
      }

      return response.data;
    },
  };
}
