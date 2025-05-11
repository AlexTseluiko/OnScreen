/**
 * Валидация email адреса
 * @param email - email для проверки
 * @returns boolean - результат валидации
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Валидация пароля
 * @param password - пароль для проверки
 * @returns { strength: number; message: string } - результат валидации
 */
export const validatePassword = (password: string): { strength: number; message: string } => {
  let strength = 0;
  let message = '';

  if (password.length < 8) {
    message = 'Пароль должен содержать минимум 8 символов';
    return { strength, message };
  }

  // Проверка на наличие цифр
  if (/\d/.test(password)) {
    strength += 1;
  }

  // Проверка на наличие букв в нижнем регистре
  if (/[a-z]/.test(password)) {
    strength += 1;
  }

  // Проверка на наличие букв в верхнем регистре
  if (/[A-Z]/.test(password)) {
    strength += 1;
  }

  // Проверка на наличие специальных символов
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength += 1;
  }

  switch (strength) {
    case 0:
      message = 'Очень слабый пароль';
      break;
    case 1:
      message = 'Слабый пароль';
      break;
    case 2:
      message = 'Средний пароль';
      break;
    case 3:
      message = 'Хороший пароль';
      break;
    case 4:
      message = 'Отличный пароль';
      break;
    default:
      message = 'Неизвестная сила пароля';
  }

  return { strength, message };
};
