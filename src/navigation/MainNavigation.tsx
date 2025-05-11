/**
 * @deprecated Этот файл устарел и сохранен только для обратной совместимости.
 * Используйте импорт из './index' вместо прямого импорта этого файла.
 * Навигация перемещена в файл AppNavigator.tsx и экспортируется через index.ts.
 */

import React from 'react';
import { Text } from 'react-native';
import { Navigation } from './index';

console.warn(
  'MainNavigation.tsx устарел. Используйте импорт из "./navigation" вместо прямого импорта'
);

// Реэкспортируем типы для обратной совместимости
export * from './types';

// Реэкспортируем основной навигатор для обратной совместимости
export const MainNavigation = () => <Navigation />;
