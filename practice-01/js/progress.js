"use strict";

const totalTasks = 18;
const completedTasks = 6;

function printProgress(total, completed) {
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

  if (total === 0 && completed === 0) {
    console.log("Задач пока нет");
    return;
  }

  const remaining = total - completed;
  const progressPercent = (completed / total) * 100;

  let status = "В работе";
  if (completed === 0) {
    status = "Не начато";
  } else if (completed === total) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${total}`);
  console.log(`Выполнено: ${completed}`);
  console.log(`Осталось: ${remaining}`);
  console.log(`Прогресс: ${progressPercent.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}

printProgress(totalTasks, completedTasks);
