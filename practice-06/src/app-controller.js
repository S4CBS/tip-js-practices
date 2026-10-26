import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (
    !api
    || !view
    || typeof api.loadInitialData !== "function"
    || typeof api.getTasks !== "function"
    || typeof view.setListState !== "function"
  ) {
    throw new TypeError("Некорректные зависимости api или view для createAppController.");
  }

  let currentTasks = [];
  let currentCategories = null;
  let currentFilters = {};
  let editingId = null;
  let currentAbortController = null;

  const controller = {
    async start(filters = {}) {
      currentFilters = { ...filters };
      return this.refresh();
    },

    async applyFilters(newFilters) {
      currentFilters = { ...currentFilters, ...newFilters };
      return this.refresh();
    },

    async refresh() {
      if (currentAbortController) {
        currentAbortController.abort();
      }
      currentAbortController = new AbortController();
      const signal = currentAbortController.signal;

      view.setListState("loading");

      try {
        if (currentCategories === null) {
          const res = await api.loadInitialData(currentFilters, { signal });
          if (signal.aborted) return;
          currentCategories = res.categories;
          currentTasks = res.tasks;
          view.setCategories(currentCategories);
          view.setTasks(currentTasks, currentFilters);
          view.setTotal(res.meta.total);
          view.setListState(currentTasks.length > 0 ? "ready" : "empty");
        } else {
          const res = await api.getTasks(currentFilters, { signal });
          if (signal.aborted) return;
          currentTasks = res.tasks;
          view.setTasks(currentTasks, currentFilters);
          view.setTotal(res.meta.total);
          view.setListState(currentTasks.length > 0 ? "ready" : "empty");
        }
      } catch (err) {
        if (signal.aborted || (err instanceof ApiError && err.kind === "aborted")) {
          return;
        }
        view.setListState("error", messageForError(err));
      }
    },

    beginEdit(id) {
      const task = currentTasks.find((t) => t.id === id);
      if (task) {
        editingId = id;
        view.setFormTask(task);
      }
    },

    cancelEdit() {
      editingId = null;
      view.setFormTask(null);
    },

    async submit(draft) {
      const validation = validateDraft(draft, currentCategories);
      if (!validation.valid) {
        view.showFormErrors(validation.errors);
        return;
      }

      view.setMutationPending(true);
      try {
        if (editingId === null) {
          await api.createTask(validation.value);
          view.notify("Задача успешно создана.", "success");
          view.setFormTask(null);
        } else {
          await api.updateTask(editingId, validation.value);
          view.notify("Задача успешно обновлена.", "success");
          editingId = null;
          view.setFormTask(null);
        }
        await this.refresh();
      } catch (err) {
        view.notify(messageForError(err), "error");
      } finally {
        view.setMutationPending(false);
      }
    },

    async toggleTask(id) {
      const task = currentTasks.find((t) => t.id === id);
      if (!task) return;

      view.setMutationPending(true);
      try {
        await api.setTaskCompleted(id, !task.completed);
        await this.refresh();
      } catch (err) {
        view.notify(messageForError(err), "error");
      } finally {
        view.setMutationPending(false);
      }
    },

    async deleteTask(id) {
      view.setMutationPending(true);
      try {
        await api.deleteTask(id);
        await this.refresh();
      } catch (err) {
        view.notify(messageForError(err), "error");
      } finally {
        view.setMutationPending(false);
      }
    },

    async resetData() {
      view.setMutationPending(true);
      try {
        await api.resetDemoData();
        await this.refresh();
      } catch (err) {
        view.notify(messageForError(err), "error");
      } finally {
        view.setMutationPending(false);
      }
    },

    destroy() {
      if (currentAbortController) {
        currentAbortController.abort();
      }
    },
  };

  return controller;
}
