// Общий контрольный набор.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Индивидуальный вариант 6: Проверка пользовательского интерфейса
// Идентификаторы: 11, 23, 37, 41, 58, 64
// Для Варианта 6 изначально выполнено 5 задач (K = 5)
export const variantNumber = 6;
export const variantTasks = [
  { id: 11, title: "Проверить адаптивную вёрстку на мобильных устройствах", completed: true, priority: "high" },
  { id: 23, title: "Протестировать контрастность и цветовую доступность", completed: true, priority: "medium" },
  { id: 37, title: "Проверить валидацию полей ввода формы", completed: true, priority: "low" },
  { id: 41, title: "Провести тестирование клавиатурной навигации", completed: true, priority: "high" },
  { id: 58, title: "Оценить скорость отрисовки и отклик интерфейса", completed: true, priority: "medium" },
  { id: 64, title: "Составить чек-лист пользовательского тестирования", completed: false, priority: "low" },
];
