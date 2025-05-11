# Инфраструктура API OnScreen

В проекте реализована надежная, производительная и удобная инфраструктура для работы с API.

## Основные компоненты

### 1. ApiService (apiService.ts)

Основной класс для выполнения HTTP-запросов, реализованный по паттерну Singleton.

**Возможности:**

- Поддержка всех HTTP-методов (GET, POST, PUT, DELETE)
- Автоматическое обновление токена авторизации
- Интеллектуальное кэширование запросов
- Обработка сетевых ошибок и повторные попытки
- Работа в офлайн-режиме с очередью запросов
- Перехватчики запросов и ответов

**Пример использования:**

```typescript
import { apiService } from '../api/apiService';

// GET запрос с кэшированием
const data = await apiService.get<UserProfile>('/user/profile', {
  cacheKey: 'user_profile',
  cacheDuration: 5 * 60 * 1000, // 5 минут
});

// POST запрос
const response = await apiService.post<LoginResponse>('/auth/login', {
  email: 'user@example.com',
  password: 'password123',
});
```

### 2. Хуки для работы с API (useApi.ts)

React-хуки для удобной работы с API из функциональных компонентов.

**Возможности:**

- Автоматическая загрузка данных при монтировании компонента
- Отслеживание состояния загрузки (loading, success, error)
- Удобный доступ к данным и ошибкам
- Автоматическая отмена запросов при размонтировании
- Пакетное выполнение запросов

**Пример использования:**

```typescript
import { useApi } from '../hooks/useApi';

function UserProfile() {
  const {
    data: profile,
    isLoading,
    error,
    refresh,
  } = useApi({
    url: '/user/profile',
    cacheKey: 'user_profile',
    autoLoad: true,
  });

  if (isLoading) return <Loading />;
  if (error) return <ApiError error={error} onRetry={refresh} />;

  return <ProfileView profile={profile} />;
}
```

### 3. Контекст API (ApiContext.tsx)

React Context для глобального доступа к состоянию API.

**Возможности:**

- Управление токенами авторизации
- Отслеживание состояния сети
- Управление кэшем
- Централизованный доступ к API из любого компонента

**Пример использования:**

```typescript
import { useApi } from '../contexts/ApiContext';

function Header() {
  const { isAuthenticated, setAuthToken } = useApi();

  const handleLogout = () => {
    setAuthToken(null);
  };

  return (
    <View>
      {isAuthenticated && (
        <Button title="Выйти" onPress={handleLogout} />
      )}
    </View>
  );
}
```

### 4. Обработка ошибок (errorHandler.ts)

Централизованная система обработки ошибок API.

**Возможности:**

- Классификация ошибок по типам
- Форматирование ошибок для отображения пользователю
- Локализация сообщений об ошибках
- Глобальная обработка ошибок авторизации

**Пример использования:**

```typescript
import { formatApiError } from '../utils/errorHandler';

try {
  const data = await apiService.get('/some/endpoint');
  // Обработка успешного ответа
} catch (error) {
  const formattedError = formatApiError(error);
  // Отображение ошибки пользователю
}
```

### 5. Мониторинг производительности (performanceMonitor.ts, useApiPerformance.ts)

Система для мониторинга производительности API запросов.

**Возможности:**

- Измерение времени выполнения запросов
- Отслеживание количества ошибок
- Определение "узких мест" в API
- Визуализация статистики

**Пример использования:**

```typescript
import { useApiPerformance } from '../hooks/useApiPerformance';

function ApiStats() {
  const { getAllStats, getSlowestEndpoints, getMostErrorProneEndpoints } = useApiPerformance();

  // Получение и отображение статистики
}
```

### 6. Компоненты для API

- **ApiError** (молекула) - компонент для отображения ошибок API
- **ApiPerformanceMonitor** (организм) - компонент для отображения статистики производительности

## Дополнительные возможности

- **Логирование** - все запросы и ошибки логируются для отладки
- **Управление токенами** - автоматическое обновление токенов авторизации
- **Работа без сети** - кэширование и очереди запросов для работы офлайн
- **Типизация** - полная поддержка TypeScript для безопасности типов

## Будущие улучшения

- Интеграция с GraphQL
- Реализация WebSocket для реального времени
- Улучшение сжатия данных для экономии трафика
- Оптимизация батчинга запросов
