# OnScreen - Медицинское мобильное приложение

Мобильное приложение для пациентов и врачей, упрощающее доступ к медицинским услугам.

## Особенности

- Поиск медицинских учреждений и врачей
- Запись на прием
- Хранение медицинской карты
- Экстренная AI помощь
- Чат с врачом
- Напоминания о приеме лекарств

## Технологии

- React Native
- TypeScript
- React Navigation
- i18next
- Expo
- React Native Vector Icons

## Структура проекта

### Компоненты

Проект использует архитектуру Presentational и Container компонентов для четкого разделения ответственности:

- **Presentational компоненты** (`*View.tsx`):

  - Отвечают только за отображение
  - Не содержат бизнес-логики
  - Получают данные через props
  - Легко тестируются
  - Могут быть переиспользованы

- **Container компоненты** (`*Container.tsx`):
  - Отвечают за бизнес-логику
  - Управляют состоянием
  - Обрабатывают события
  - Подключают данные
  - Передают данные в Presentational компоненты

### Тема и стили

Проект использует единую систему тем и стилей:

- `src/theme/colors.ts` - цветовая палитра
- `src/theme/spacing.ts` - отступы
- `src/theme/shadows.ts` - тени
- `src/theme/animations.ts` - анимации
- `src/theme/typography.ts` - типографика

### Типы

Все типы определены в соответствующих файлах:

- `src/types/components.ts` - общие типы компонентов
- `src/types/api.ts` - типы для API
- `src/types/navigation.ts` - типы для навигации

### Хуки

Проект использует кастомные хуки для переиспользуемой логики:

- `src/hooks/useTheme.ts` - хук для работы с темой
- `src/hooks/useAuth.ts` - хук для работы с авторизацией
- `src/hooks/useApi.ts` - хук для работы с API

## Установка и запуск

1. Установите зависимости:

```bash
npm install
```

2. Запустите проект:

```bash
npm start
```

## Разработка

### Создание нового компонента

1. Создайте директорию для компонента в `src/components/`
2. Создайте файлы:
   - `types.ts` - типы компонента
   - `ComponentView.tsx` - Presentational компонент
   - `ComponentContainer.tsx` - Container компонент
   - `index.ts` - экспорт компонента

### Стилизация

Используйте существующие константы из темы:

- Цвета: `colors.primary`, `colors.secondary` и т.д.
- Отступы: `spacing.sm`, `spacing.md` и т.д.
- Тени: `getShadowStyle(isDark)`
- Анимации: `createAnimation()`

### Типизация

Все компоненты должны быть типизированы:

- Используйте интерфейсы из `src/types/components.ts`
- Добавляйте JSDoc-комментарии
- Используйте строгую типизацию

## Тестирование

1. Запустите тесты:

```bash
npm test
```

2. Проверьте покрытие:

```bash
npm run test:coverage
```

## Атомарные компоненты

Проект использует методологию атомарного дизайна для создания удобных и переиспользуемых компонентов.

### Атомы

Атомы - базовые строительные блоки интерфейса.

| Компонент       | Описание                                                   |
| --------------- | ---------------------------------------------------------- |
| `Text`          | Текстовый компонент с поддержкой различных стилей и темы   |
| `Button`        | Кнопка с поддержкой различных вариантов и состояний        |
| `Input`         | Поле ввода с поддержкой иконок и состояний                 |
| `Icon`          | Иконка с поддержкой различных библиотек иконок             |
| `Divider`       | Разделительная линия с поддержкой темы                     |
| `Avatar`        | Аватар пользователя с поддержкой изображений или инициалов |
| `TouchableCard` | Нажимаемая карточка с поддержкой теней                     |
| `Checkbox`      | Чекбокс с поддержкой различных состояний                   |
| `Badge`         | Бейдж для отображения счетчиков или статусов               |
| `Card`          | Контейнер для группировки информации                       |
| `Alert`         | Уведомление с поддержкой различных типов                   |
| `Chip`          | Компонент для отображения тегов и фильтров                 |
| `Rating`        | Компонент для отображения и выставления рейтинга           |

### Молекулы

Молекулы - комбинации атомов для создания более сложных компонентов интерфейса.

| Компонент     | Описание                                             |
| ------------- | ---------------------------------------------------- |
| `ListItem`    | Элемент списка с различными состояниями              |
| `SearchInput` | Поле поиска с кнопкой очистки и фильтрами            |
| `IconButton`  | Кнопка с иконкой                                     |
| `Card`        | Продвинутая карточка с заголовком и действиями       |
| `BottomSheet` | Выдвигающийся снизу лист с поддержкой перетаскивания |

### Организмы

Организмы - сложные компоненты, объединяющие молекулы и атомы для выполнения конкретных функций.

| Компонент     | Описание                              |
| ------------- | ------------------------------------- |
| `FilterModal` | Модальное окно с фильтрами для поиска |

## Примеры использования

### Text

```jsx
import { Text } from '../components/ui/atoms/Text';

// Стандартный текст
<Text>Обычный текст</Text>

// Заголовок
<Text variant="title">Заголовок экрана</Text>

// Подзаголовок
<Text variant="subtitle">Подзаголовок</Text>

// Маленький текст
<Text variant="caption">Мелкий текст</Text>
```

### Button

```jsx
import { Button } from '../components/ui/atoms/Button';

// Стандартная кнопка
<Button title="Нажмите меня" onPress={() => console.log('Нажата кнопка')} />

// Кнопка с контуром
<Button title="Отмена" variant="outline" onPress={() => console.log('Отмена')} />

// Прозрачная кнопка
<Button title="Пропустить" variant="ghost" onPress={() => console.log('Пропустить')} />

// Отключенная кнопка
<Button title="Недоступно" disabled />
```

### Input

```jsx
import { Input } from '../components/ui/atoms/Input';
import { Icon } from '../components/ui/atoms/Icon';

// Стандартное поле ввода
<Input placeholder="Введите текст" />

// Поле ввода с иконкой
<Input
  placeholder="Поиск"
  leftIcon={<Icon name="search" family="ionicons" size={20} />}
/>

// Поле ввода с ошибкой
<Input
  placeholder="Email"
  error="Неверный формат email"
/>
```

### SearchInput

```jsx
import { SearchInput } from '../components/ui/molecules/SearchInput';

// Стандартное поле поиска
<SearchInput
  placeholder="Поиск услуг, врачей..."
  onSearch={(query) => console.log('Поиск:', query)}
  onClear={() => console.log('Поиск очищен')}
/>

// Поле поиска с фильтрами
<SearchInput
  placeholder="Поиск клиник"
  showFilterButton
  activeFiltersCount={3}
  onFilter={() => setFilterModalVisible(true)}
/>
```

### FilterModal

```jsx
import { FilterModal } from '../components/ui/organisms/FilterModal';

const [filterModalVisible, setFilterModalVisible] = useState(false);
const [filterGroups, setFilterGroups] = useState([
  {
    id: 'category',
    title: 'Категория',
    options: [
      { id: 'doctors', label: 'Врачи', selected: false },
      { id: 'clinics', label: 'Клиники', selected: true },
    ],
  },
  {
    id: 'rating',
    title: 'Рейтинг',
    options: [
      { id: '4plus', label: '4+', selected: false },
      { id: '3plus', label: '3+', selected: false },
    ],
  },
]);

<FilterModal
  visible={filterModalVisible}
  onClose={() => setFilterModalVisible(false)}
  filterGroups={filterGroups}
  onApply={filters => {
    setFilterGroups(filters);
    setFilterModalVisible(false);
  }}
  title="Фильтры"
/>;
```

### BottomSheet

```jsx
import { BottomSheet } from '../components/ui/molecules/BottomSheet';

const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

<BottomSheet
  visible={bottomSheetVisible}
  onClose={() => setBottomSheetVisible(false)}
  title="Дополнительные опции"
  height={300}
>
  <Text>Содержимое нижнего листа</Text>
  <Button title="Закрыть" onPress={() => setBottomSheetVisible(false)} />
</BottomSheet>;
```

## Лицензия

MIT

## Улучшения API

В проекте реализованы следующие улучшения для работы с API:

### 1. Сервис для работы с API (apiService)

- Реализован паттерн Singleton для удобного доступа
- Поддержка всех HTTP-методов (GET, POST, PUT, DELETE)
- Автоматическое обновление токена при его истечении
- Обработка сетевых ошибок и повторные попытки при неудачных запросах
- Перехват запросов и ответов с помощью interceptors

### 2. Кэширование запросов

- Интеллектуальное кэширование GET-запросов
- Настраиваемое время жизни кэша для разных типов запросов
- Принудительное обновление кэша при необходимости
- Статистика использования кэша

### 3. Обработка ошибок

- Единый механизм обработки ошибок API
- Форматирование ошибок для отображения пользователю
- Локализация сообщений об ошибках
- Компонент ApiError для отображения ошибок в UI

### 4. Работа в офлайн-режиме

- Автоматическое определение состояния сети
- Кэширование данных для работы в офлайн-режиме
- Очередь запросов для отправки при восстановлении соединения

### 5. Удобные хуки для работы с API

- useApi - хук для выполнения единичных запросов
- useBatchApi - хук для пакетного выполнения запросов
- Поддержка отмены запросов при размонтировании компонентов
- Автоматическая загрузка данных при монтировании
