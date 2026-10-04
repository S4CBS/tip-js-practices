import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";

function printStatsHeader(title, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`\n--- ${title} ---`);
  console.log(`Всего: ${total}; Выполнено: ${completed}; Осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

console.log("==================================================");
console.log("ПР2. Демонстрационный сценарий");
console.log("Студент: Панов Алексей Алексеевич (ЭФБо-13-25)");
console.log("Вариант:", variantNumber);
console.log("==================================================");

// -----------------------------------------------------------------
// 1. Общий демонстрационный сценарий (demoTasks)
// -----------------------------------------------------------------
console.log("\n>>> ЧАСТЬ 1. Общий сценарий на demoTasks <<<");

let currentTasks = demoTasks;
printStatsHeader("Этап 0: Исходный набор demoTasks", currentTasks);
console.log("Названия задач:", getTaskTitles(currentTasks));
console.log("Невыполненные задачи (id):", getPendingTasks(currentTasks).map((t) => t.id));

// Шаг 1: Добавление задачи id = 20
const addResult = addTask(currentTasks, 20, "Добавить проверку", "high");
if (addResult.ok) {
  currentTasks = addResult.tasks;
  printStatsHeader("Этап 1: Добавлена задача id = 20", currentTasks);
} else {
  console.error("Ошибка добавления:", addResult.error);
}

// Шаг 2: Изменение статуса задачи id = 4 на completed = true
const completeResult = setTaskCompleted(currentTasks, 4, true);
if (completeResult.ok) {
  currentTasks = completeResult.tasks;
  printStatsHeader("Этап 2: Выполнена задача id = 4", currentTasks);
} else {
  console.error("Ошибка изменения статуса:", completeResult.error);
}

// Шаг 3: Переименование задачи id = 10
const renameResult = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (renameResult.ok) {
  currentTasks = renameResult.tasks;
  printStatsHeader("Этап 3: Переименована задача id = 10", currentTasks);
} else {
  console.error("Ошибка переименования:", renameResult.error);
}

// Шаг 4: Удаление задачи id = 7
const removeResult = removeTask(currentTasks, 7);
if (removeResult.ok) {
  currentTasks = removeResult.tasks;
  printStatsHeader("Этап 4: Удалена задача id = 7", currentTasks);
} else {
  console.error("Ошибка удаления:", removeResult.error);
}

console.log("\nИтоговые идентификаторы общего сценария:", currentTasks.map((t) => t.id));

// Шаг 5: Демонстрация обработки ошибок
console.log("\n--- Проверка обработки ошибочных операций ---");
const duplicateAttempt = addTask(currentTasks, 20, "Повторный дубликат");
console.log("Повторное добавление id = 20 -> ok:", duplicateAttempt.ok, "| ошибка:", duplicateAttempt.error);

const invalidStatusAttempt = setTaskCompleted(currentTasks, 4, "true");
console.log("Передача строки 'true' в статус -> ok:", invalidStatusAttempt.ok, "| ошибка:", invalidStatusAttempt.error);

const missingTaskAttempt = removeTask(currentTasks, 999);
console.log("Удаление несуществующей задачи id = 999 -> ok:", missingTaskAttempt.ok, "| ошибка:", missingTaskAttempt.error);

// Проверка неизменности исходного demoTasks
console.log("\n--- Проверка иммутабельности исходных данных ---");
console.log("Длина demoTasks после всех операций:", demoTasks.length);
console.log("Статус задачи id = 4 в demoTasks:", findTaskById(demoTasks, 4)?.completed);
console.log("Статус задачи id = 4 в currentTasks:", findTaskById(currentTasks, 4)?.completed);

// -----------------------------------------------------------------
// 2. Индивидуальный сценарий (Вариант 6: Проверка пользовательского интерфейса)
// -----------------------------------------------------------------
console.log("\n==================================================");
console.log(">>> ЧАСТЬ 2. Индивидуальный сценарий (Вариант 6) <<<");
console.log("Тематика: Проверка пользовательского интерфейса");
console.log("==================================================");

let currentVariantTasks = variantTasks;
printStatsHeader("Этап 0: Исходный набор варианта 6", currentVariantTasks);
console.log("Исходные названия:", getTaskTitles(currentVariantTasks));

// 1. Добавить задачу id = 80 с приоритетом low (по таблице Варианта 6)
const varAddResult = addTask(currentVariantTasks, 80, "Зафиксировать замечания дизайн-ревью", "low");
if (varAddResult.ok) {
  currentVariantTasks = varAddResult.tasks;
  printStatsHeader("Этап 1: Добавлена задача id = 80 (low)", currentVariantTasks);
}

// 2. Установить completed = true для id = 11
const varCompleteResult = setTaskCompleted(currentVariantTasks, 11, true);
if (varCompleteResult.ok) {
  currentVariantTasks = varCompleteResult.tasks;
  printStatsHeader("Этап 2: Выполнена задача id = 11", currentVariantTasks);
}

// 3. Переименовать id = 23
const varRenameResult = renameTask(
  currentVariantTasks,
  23,
  "Провести аудит цветового контраста WCAG"
);
if (varRenameResult.ok) {
  currentVariantTasks = varRenameResult.tasks;
  printStatsHeader("Этап 3: Переименована задача id = 23", currentVariantTasks);
}

// 4. Удалить id = 37
const varRemoveResult = removeTask(currentVariantTasks, 37);
if (varRemoveResult.ok) {
  currentVariantTasks = varRemoveResult.tasks;
  printStatsHeader("Этап 4: Удалена задача id = 37", currentVariantTasks);
}

// 5. Повторно добавить id = 80 (ожидается отказ)
const varDupResult = addTask(currentVariantTasks, 80, "Повторная фиксация", "low");
console.log("\nПопытка повторного добавления id = 80 -> ok:", varDupResult.ok, "| ошибка:", varDupResult.error);

printStatsHeader("Итоговое состояние набора Варианта 6", currentVariantTasks);
console.log("Итоговые идентификаторы:", currentVariantTasks.map((t) => t.id));
console.log("Сохранность исходного variantTasks (длина 6, не мутирован):", variantTasks.length === 6);
