import { Platform, Dimensions } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export const getDeviceInfo = async () => {
  const deviceType = await Device.getDeviceTypeAsync();

  return {
    platform: Platform.OS,
    platformVersion: Platform.Version,
    deviceType,
    brand: Device.brand,
    modelName: Device.modelName,
    osVersion: Device.osVersion,
    screenWidth: Dimensions.get('window').width,
    screenHeight: Dimensions.get('window').height,
    appVersion: Constants.expoConfig?.version || 'unknown',
    buildNumber:
      Constants.expoConfig?.ios?.buildNumber ||
      Constants.expoConfig?.android?.versionCode ||
      'unknown',
    isDevice: Device.isDevice,
    isEmulator: !Device.isDevice,
  };
};
