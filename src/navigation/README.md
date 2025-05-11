# Система навигации OnScreen

## Структура навигации

Система навигации OnScreen построена на базе React Navigation и состоит из следующих компонентов:

### Основные файлы

- **index.ts** - единая точка входа для навигации, экспортирует основной навигатор и типы
- **AppNavigator.tsx** - главный компонент навигации, содержит все стеки экранов
- **types.ts** - типы для всех навигационных компонентов

### Устаревшие файлы (оставлены для обратной совместимости)

- **AppNavigation.tsx** - устаревший файл, заменен на AppNavigator
- **MainNavigation.tsx** - устаревший файл, заменен на AppNavigator

## Типы навигаторов

1. **Stack Navigator** - основной навигатор, который управляет переходами между экранами
2. **Tab Navigator** - навигатор вкладок для основных разделов приложения:
   - PatientTabNavigator - для пациентов
   - DoctorTabNavigator - для врачей
   - AdminTabNavigator - для администраторов

## Группы экранов

Навигация структурирована по следующим группам экранов:

1. **Экраны авторизации** - для аутентификации пользователей
2. **Основные экраны** - общие для всех типов пользователей
3. **Экраны для пациентов** - доступны только пациентам
4. **Экраны для врачей** - доступны только врачам
5. **Экраны для администраторов** - доступны только администраторам

## Использование

```typescript
// Импорт навигации
import { Navigation } from './navigation';

// Импорт типов
import { RootStackParamList } from './navigation';

// Использование хука навигации
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const navigation = useNavigation<NavigationProp>();
navigation.navigate('Profile');
```

## Миграция со старой системы навигации

Если вы используете устаревшие файлы навигации, рекомендуется перейти на новую систему:

1. Замените импорты из `./navigation/AppNavigation` или `./navigation/MainNavigation` на импорты из `./navigation`
2. Используйте типы из `./navigation/types` для навигации
