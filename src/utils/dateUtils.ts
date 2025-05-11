import i18n from '../i18n';

/**
 * Утилиты для работы с датами
 */

/**
 * Форматирует дату в понятный пользователю вид
 * Преобразует формат ISO 8601 в формат дд.мм.гггг
 *
 * @param dateString строка с датой в формате ISO 8601
 * @returns отформатированная дата (например, 14.05.2024)
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Проверка на валидность даты
  if (isNaN(date.getTime())) {
    return dateString; // Возвращаем исходную строку, если дата некорректная
  }

  // Получаем компоненты даты
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Возвращаем отформатированную дату
  return `${day}.${month}.${year}`;
};

/**
 * Форматирует время из ISO-строки в привычный для пользователя формат
 *
 * @param dateString строка с датой и временем в формате ISO 8601
 * @returns отформатированное время (например, 14:30)
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);

  // Проверка на валидность даты
  if (isNaN(date.getTime())) {
    return dateString; // Возвращаем исходную строку, если дата некорректная
  }

  // Получаем компоненты времени
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Возвращаем отформатированное время
  return `${hours}:${minutes}`;
};

/**
 * Проверяет, является ли дата сегодняшней
 *
 * @param dateString строка с датой в формате ISO 8601
 * @returns true, если дата соответствует сегодняшнему дню
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Форматирует дату с отображением относительного времени
 * Например "Сегодня", "Завтра", "27 мая" и т.д.
 *
 * @param dateString строка с датой в формате ISO 8601
 * @returns отформатированная дата с относительным временем
 */
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Проверяем сегодняшнюю дату
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return 'Сегодня';
  }

  // Проверяем завтрашнюю дату
  if (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  ) {
    return 'Завтра';
  }

  // Для остальных дат
  const day = date.getDate();
  const month = date.getMonth();

  // Массив названий месяцев в родительном падеже
  const monthNames = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  return `${day} ${monthNames[month]}`;
};
