import { Alert } from 'react-native';

export const showToast = (message: string): void => {
  Alert.alert('Успех', message, [{ text: 'OK', style: 'default' }]);
};
