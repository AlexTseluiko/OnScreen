export const showToast = (message: string): void => {
  // Используем стандартный веб-API для показа уведомлений
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification(message);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(message);
        }
      });
    }
  }

  // Дополнительно показываем сообщение в консоли для отладки
  console.log('Toast:', message);
};
