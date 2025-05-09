import { Platform } from 'react-native';
import { showToast as webToast } from './toast.web';
import { showToast as androidToast } from './toast.android';
import { showToast as iosToast } from './toast.ios';

export const showToast = Platform.select({
  web: webToast,
  android: androidToast,
  ios: iosToast,
  default: webToast,
});
