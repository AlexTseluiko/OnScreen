import { Platform, ToastAndroid } from 'react-native';

export const showToast = (message: string) => {
  if (Platform.OS === 'web') {
    // Для веб-платформы используем простой alert
    alert(message);
  } else if (Platform.OS === 'android') {
    try {
      if (ToastAndroid) {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Toast error:', error);
    }
  }
};
