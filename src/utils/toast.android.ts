import { ToastAndroid } from 'react-native';

export const showToast = (message: string): void => {
  ToastAndroid.show(message, ToastAndroid.SHORT);
};
