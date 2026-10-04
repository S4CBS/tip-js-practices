"use strict";

const totalTasks = 18;
const completedTasks = 6;
const dailyLimit = 5;

function planTasks(total, completed, limit) {
  if (
    typeof total !== "number" ||
    typeof completed !== "number" ||
    !Number.isInteger(total) ||
    !Number.isInteger(completed)
  ) {
    console.log("Ошибка: общее количество и число выполненных задач должны быть целыми числами.");
    return;
  }

  if (total < 0 || total > 1000) {
    console.log("Ошибка: общее количество задач должно находиться в диапазоне от 0 до 1000.");
    return;
  }

  if (completed < 0 || completed > total) {
    console.log("Ошибка: количество выполненных задач не может быть отрицательным или превышать общее число.");
    return;
  }

  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 1000) {
    console.log("Ошибка: дневная норма должна быть целым числом в диапазоне от 1 до 1000.");
    return;
  }

  let remaining = total - completed;
  console.log(`Осталось задач: ${remaining}`);

  if (remaining === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
    return;
  }

  let day = 0;
  while (remaining > 0) {
    day += 1;
    const doneToday = Math.min(limit, remaining);
    remaining -= doneToday;
    console.log(`День ${day}: выполнено ${doneToday}, осталось ${remaining}`);
  }

  console.log(`Потребуется дней: ${day}`);
}

planTasks(totalTasks, completedTasks, dailyLimit);
