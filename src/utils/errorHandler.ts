import { ApiErrorResponse } from '../api/apiService';
import { logger } from './logger';
import i18n from '../i18n';

// Типы ошибок
export type ErrorType =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'validation'
  | 'notFound'
  | 'server'
  | 'unknown';

// Интерфейс для локализованной ошибки
export interface FormattedError {
  type: ErrorType;
  title: string;
  message: string;
  code: string;
  details?: Record<string, string | string[]>;
  retry?: boolean;
}

/**
 * Форматирует ошибку API для отображения пользователю
 */
export function formatApiError(error: ApiErrorResponse): FormattedError {
  // Определяем тип ошибки
  let errorType: ErrorType = 'unknown';

  if (!error.status || error.code === 'NETWORK_ERROR') {
    errorType = 'network';
  } else if (error.code === 'TIMEOUT') {
    errorType = 'timeout';
  } else if (error.status === 401 || error.status === 403) {
    errorType = 'auth';
  } else if (error.status === 400 || error.status === 422) {
    errorType = 'validation';
  } else if (error.status === 404) {
    errorType = 'notFound';
  } else if (error.status >= 500) {
    errorType = 'server';
  }

  // Логируем ошибку
  logger.error(`API Error (${errorType}): ${error.message}`, {
    code: error.code,
    status: error.status,
    details: error.details,
  });

  // Форматируем сообщение об ошибке
  return {
    type: errorType,
    title: getErrorTitle(errorType),
    message: getErrorMessage(error, errorType),
    code: error.code,
    details: error.details as Record<string, string | string[]> | undefined,
    retry: canRetry(errorType),
  };
}

/**
 * Возвращает заголовок ошибки в зависимости от типа
 */
function getErrorTitle(type: ErrorType): string {
  const t = i18n.t;

  switch (type) {
    case 'network':
      return t('errors.network.title', 'Проблема с подключением');
    case 'timeout':
      return t('errors.timeout.title', 'Время ожидания истекло');
    case 'auth':
      return t('errors.auth.title', 'Ошибка авторизации');
    case 'validation':
      return t('errors.validation.title', 'Некорректные данные');
    case 'notFound':
      return t('errors.notFound.title', 'Не найдено');
    case 'server':
      return t('errors.server.title', 'Ошибка сервера');
    case 'unknown':
    default:
      return t('errors.unknown.title', 'Что-то пошло не так');
  }
}

/**
 * Возвращает сообщение об ошибке в зависимости от типа и данных ошибки
 */
function getErrorMessage(error: ApiErrorResponse, type: ErrorType): string {
  const t = i18n.t;

  // Если есть сообщение в ошибке, используем его
  if (error.message && error.message !== 'Error') {
    return error.message;
  }

  // Иначе используем стандартные сообщения
  switch (type) {
    case 'network':
      return t('errors.network.message', 'Проверьте подключение к интернету и повторите попытку');
    case 'timeout':
      return t('errors.timeout.message', 'Сервер не отвечает, попробуйте повторить запрос позже');
    case 'auth':
      return error.status === 401
        ? t('errors.auth.unauthorized', 'Необходима авторизация для доступа')
        : t('errors.auth.forbidden', 'У вас нет доступа к этому ресурсу');
    case 'validation':
      // Формируем сообщение из деталей ошибки валидации
      if (error.details && typeof error.details === 'object') {
        const fields = Object.keys(error.details);
        if (fields.length > 0) {
          const fieldErrors = fields
            .map(field => {
              const fieldError = error.details?.[field];
              return typeof fieldError === 'string'
                ? fieldError
                : Array.isArray(fieldError)
                  ? fieldError[0]
                  : null;
            })
            .filter(Boolean);

          if (fieldErrors.length > 0) {
            return fieldErrors.join('. ');
          }
        }
      }
      return t('errors.validation.message', 'Пожалуйста, проверьте введенные данные');
    case 'notFound':
      return t('errors.notFound.message', 'Запрашиваемый ресурс не найден');
    case 'server':
      return t(
        'errors.server.message',
        'На сервере произошла ошибка, пожалуйста, повторите попытку позже'
      );
    case 'unknown':
    default:
      return t(
        'errors.unknown.message',
        'Произошла непредвиденная ошибка. Пожалуйста, повторите попытку'
      );
  }
}

/**
 * Определяет, можно ли повторить запрос при данном типе ошибки
 */
function canRetry(type: ErrorType): boolean {
  return ['network', 'timeout', 'server', 'unknown'].includes(type);
}

/**
 * Обработчик глобальных ошибок API
 */
export function handleGlobalError(
  error: ApiErrorResponse,
  onAuthError?: () => void,
  onShowError?: (error: FormattedError) => void
): void {
  // Форматируем ошибку
  const formattedError = formatApiError(error);

  // Если ошибка авторизации и есть обработчик, вызываем его
  if (formattedError.type === 'auth' && onAuthError) {
    onAuthError();
  }

  // Показываем ошибку пользователю
  if (onShowError) {
    onShowError(formattedError);
  }
}

/**
 * Создает дружественное сообщение об ошибке для разных случаев использования
 */
export function createFriendlyError(action: string, error: ApiErrorResponse): string {
  const formattedError = formatApiError(error);

  return `${action}: ${formattedError.message}`;
}

/**
 * Возвращает ошибку по умолчанию для использования в случае неожиданных проблем
 */
export function getDefaultError(): FormattedError {
  return {
    type: 'unknown',
    title: i18n.t('errors.unknown.title', 'Что-то пошло не так'),
    message: i18n.t(
      'errors.unknown.message',
      'Произошла непредвиденная ошибка. Пожалуйста, повторите попытку'
    ),
    code: 'UNKNOWN_ERROR',
    retry: true,
  };
}

export const handleError = (error: Error): void => {
  console.error('Error:', error.message);
  // ... existing code ...
};

interface ApiErrorDetail {
  field?: string;
  message: string;
}

interface ApiError {
  message: string;
  code?: string;
  details?: ApiErrorDetail[];
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    // Проверяем наличие сообщения об ошибке
    if (typeof apiError.message === 'string') {
      return apiError.message;
    }
    // Проверяем наличие деталей ошибки
    if (Array.isArray(apiError.details) && apiError.details.length > 0) {
      const firstDetail = apiError.details[0];
      if (typeof firstDetail.message === 'string') {
        return firstDetail.message;
      }
    }
  }

  return 'Произошла неизвестная ошибка';
};
