import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import { logger } from './src/utils/logger';

import App from './App';

// Настройка глобального обработчика необработанных ошибок
const errorHandler = (error, isFatal) => {
  // Логируем ошибку
  logger.error('Необработанная глобальная ошибка:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    isFatal: isFatal,
  });

  // В режиме разработки можно оставить стандартную обработку ошибок
  if (__DEV__) {
    // Стандартная обработка ошибок в режиме разработки
  } else {
    // В production можно реализовать дополнительную обработку,
    // например, отправку ошибки в систему мониторинга
  }
};

// Устанавливаем обработчик ошибок
if (global.ErrorUtils) {
  global.ErrorUtils.setGlobalHandler(errorHandler);
}

// Отключаем некоторые предупреждения для улучшения производительности
LogBox.ignoreLogs(['Setting a timer', 'Require cycle:', 'Remote debugger']);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
