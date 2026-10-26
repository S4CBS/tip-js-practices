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
  toggleLabel.textContent = task.completed ? "В работу" : "Выполнена";
  toggleButton.append(toggleLabel);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.dataset.action = "edit";
  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить";
  editButton.append(editLabel);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteButton.append(deleteLabel);

  actions.append(toggleButton, editButton, deleteButton);
  card.append(title, status, priority, actions);

  return card;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren(...tasks.map((task) => createTaskElement(task)));
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);
  const elements = {
    total: summaryElement.querySelector('[data-stat="total"]'),
    completed: summaryElement.querySelector('[data-stat="completed"]'),
    pending: summaryElement.querySelector('[data-stat="pending"]'),
    progress: summaryElement.querySelector('[data-stat="progress"]'),
    visible: summaryElement.querySelector('[data-stat="visible"]'),
  };

  if (elements.total) elements.total.textContent = String(stats.total);
  if (elements.completed) elements.completed.textContent = String(stats.completed);
  if (elements.pending) elements.pending.textContent = String(stats.pending);
  if (elements.progress) elements.progress.textContent = `${stats.progress.toFixed(1)}%`;
  if (elements.visible) elements.visible.textContent = String(visibleCount);
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (total === 0) {
    messageElement.hidden = false;
    messageElement.textContent = "Список задач пуст.";
  } else if (visibleCount === 0) {
    messageElement.hidden = false;
    messageElement.textContent = "Нет задач по выбранному фильтру.";
  } else {
    messageElement.hidden = true;
    messageElement.textContent = "";
  }
}
