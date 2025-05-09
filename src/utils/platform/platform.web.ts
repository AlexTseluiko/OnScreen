import { Platform } from 'react-native';

export const showPlatformToast = (message: string) => {
  if (Platform.OS === 'web') {
    alert(message);
  }
};

export const vibrate = () => {
  // Вибрация не поддерживается в веб-версии
};
