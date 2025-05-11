export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export class ApiErrorHandler {
  static handle(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        status: 500,
      };
    }

    if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      return {
        code: apiError.code || 'UNKNOWN_ERROR',
        message: apiError.message || 'Произошла неизвестная ошибка',
        status: apiError.status || 500,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'Произошла неизвестная ошибка',
      status: 500,
    };
  }

  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }
}
