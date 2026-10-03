import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.dataset.taskId = String(task.id);

  if (task.completed) {
    card.classList.add("is-completed");
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? "Средний";

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.dataset.action = "toggle";
  toggleButton.setAttribute("aria-pressed", String(task.completed));

  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена";
  toggleButton.append(toggleLabel);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";

  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteButton.append(deleteLabel);

  actions.append(toggleButton, deleteButton);
  card.append(title, status, priority, actions);

  return card;
}

export function renderTaskList(listElement, tasks) {
  const cards = tasks.map((task) => createTaskElement(task));
  listElement.replaceChildren(...cards);
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);

  const totalEl = summaryElement.querySelector('[data-stat="total"]');
  if (totalEl) totalEl.textContent = String(stats.total);

  const completedEl = summaryElement.querySelector('[data-stat="completed"]');
  if (completedEl) completedEl.textContent = String(stats.completed);

  const pendingEl = summaryElement.querySelector('[data-stat="pending"]');
  if (pendingEl) pendingEl.textContent = String(stats.pending);

  const progressEl = summaryElement.querySelector('[data-stat="progress"]');
  if (progressEl) progressEl.textContent = `${stats.progress.toFixed(1)}%`;

  const visibleEl = summaryElement.querySelector('[data-stat="visible"]');
  if (visibleEl) visibleEl.textContent = String(visibleCount);
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    messageElement.hidden = true;
    messageElement.textContent = "";
  } else if (total === 0) {
    messageElement.hidden = false;
    messageElement.textContent = "Список задач пуст.";
  } else {
    messageElement.hidden = false;
    messageElement.textContent = "Нет задач по выбранному фильтру.";
  }
}
