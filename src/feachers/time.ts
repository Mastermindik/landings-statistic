type FormatedTime = {
  start: number;
  end: number;
};

// Часовий пояс
const timeZone = "Europe/Kiev";

const currentDate = new Date();
const hoursInDay = 24;
const hourMilliseconds = 60 * 60 * 1000;

//Дата початку дня
const startOfDay = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth(),
  currentDate.getDate(),
  0,
  0,
  0
);

// Дата початку дня в нашому часовому поясі
startOfDay.toLocaleString("en-US", { timeZone });

//Експорт дати початку дня
export const startOfDayTimestamp = startOfDay.getTime();

//Отримання розбивки дня по годинах
const hourlyRanges: FormatedTime[] = [];

for (let i = 0; i < hoursInDay; i++) {
  const startHour = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    i,
    0,
    0
  );
  const endHour = new Date(startHour.getTime() + hourMilliseconds);

  // Приводимо до часового поясу
  startHour.toLocaleString("en-US", { timeZone });
  endHour.toLocaleString("en-US", { timeZone });

  // Додаємо кожну годину до масиву в мілісекундах
  hourlyRanges.push({
    start: startHour.getTime(),
    end: endHour.getTime(),
  });
}

// Переводимо мілісекунди в години і додаєм їх до масиву і експортуємо його
export const hoursFormatted = hourlyRanges.map((range) => ({
  start: range.start,
  end: range.end,
  startNew: new Date(range.start).toLocaleTimeString("ua-UA", {
    hour: "numeric",
    minute: "numeric",
    timeZone,
  }),
  endNew: new Date(range.end).toLocaleTimeString("ua-UA", {
    hour: "numeric",
    minute: "numeric",
    timeZone,
  }),
}));
