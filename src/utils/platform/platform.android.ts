import { Platform, ToastAndroid, Vibration } from 'react-native';

export const showPlatformToast = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  }
};

export const vibrate = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate(50);
  }
};
