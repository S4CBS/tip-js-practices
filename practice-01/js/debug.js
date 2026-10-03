"use strict";

const plannedText = "8";
const completedText = "3";
const additionalText = "2";

// Исправление: явное приведение строк к числу для исключения строковой конкатенации
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = Number(plannedText) - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

// Исправление: условие taskNumber <= 4 для суммирования номеров задач от 1 до 4 включительно
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
