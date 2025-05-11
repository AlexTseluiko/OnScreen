import { ViewStyle } from 'react-native';

export const commonStyles = {
  container: {
    flex: 1,
  } as ViewStyle,
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
};

export const shadowStyleLight: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 4,
};

export const shadowStyleDark: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
};
