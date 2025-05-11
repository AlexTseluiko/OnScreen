import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FormattedError, formatApiError, getDefaultError } from '../utils/errorHandler';
import { ApiErrorResponse } from '../api/apiService';
import { showToast } from '../utils/toast';
import { logger } from '../utils/logger';

// Интерфейс контекста обработки ошибок
interface ErrorContextType {
  // Последняя ошибка в системе
  lastError: FormattedError | null;
  // Глобальные ошибки, которые должны быть отображены пользователю
  globalErrors: FormattedError[];
  // Добавить глобальную ошибку
  addGlobalError: (error: ApiErrorResponse | FormattedError) => void;
  // Очистить глобальную ошибку по индексу
  clearGlobalError: (index: number) => void;
  // Очистить все глобальные ошибки
  clearAllGlobalErrors: () => void;
  // Обработать ошибку API
  handleApiError: (error: ApiErrorResponse, showToastNotification?: boolean) => FormattedError;
  // Устанавливает последнюю ошибку
  setLastError: (error: FormattedError | null) => void;
}

// Создаем контекст с начальным значением null
const ErrorContext = createContext<ErrorContextType | null>(null);

// Провайдер контекста
interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  // Состояние для хранения последней ошибки
  const [lastError, setLastError] = useState<FormattedError | null>(null);
  // Состояние для хранения глобальных ошибок
  const [globalErrors, setGlobalErrors] = useState<FormattedError[]>([]);

  // Добавление глобальной ошибки
  const addGlobalError = useCallback((error: ApiErrorResponse | FormattedError) => {
    const formattedError = 'type' in error ? error : formatApiError(error);

    // Логируем ошибку
    logger.error(`Global Error: ${formattedError.title} - ${formattedError.message}`, {
      code: formattedError.code,
      type: formattedError.type,
      details: formattedError.details,
    });

    setLastError(formattedError);
    setGlobalErrors(prev => [...prev, formattedError]);
  }, []);

  // Очистка глобальной ошибки по индексу
  const clearGlobalError = useCallback((index: number) => {
    setGlobalErrors(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Очистка всех глобальных ошибок
  const clearAllGlobalErrors = useCallback(() => {
    setGlobalErrors([]);
  }, []);

  // Обработка ошибки API
  const handleApiError = useCallback(
    (error: ApiErrorResponse, showToastNotification = false): FormattedError => {
      try {
        const formattedError = formatApiError(error);

        // Устанавливаем последнюю ошибку
        setLastError(formattedError);

        // Показываем уведомление, если нужно
        if (showToastNotification) {
          showToast(`${formattedError.title}: ${formattedError.message}`);
        }

        return formattedError;
      } catch (err) {
        // Если произошла ошибка при форматировании ошибки, используем ошибку по умолчанию
        const defaultError = getDefaultError();
        setLastError(defaultError);
        return defaultError;
      }
    },
    []
  );

  const contextValue: ErrorContextType = {
    lastError,
    globalErrors,
    addGlobalError,
    clearGlobalError,
    clearAllGlobalErrors,
    handleApiError,
    setLastError,
  };

  return <ErrorContext.Provider value={contextValue}>{children}</ErrorContext.Provider>;
};

// Хук для использования контекста
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);

  if (!context) {
    throw new Error('useError должен использоваться внутри ErrorProvider');
  }

  return context;
};
