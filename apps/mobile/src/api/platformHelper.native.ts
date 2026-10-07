/**
 * Platform helper for Native React Native (iOS & Android)
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const currentPlatform: string = Platform.OS;
export const expoHostUri: string | undefined =
  Constants?.expoConfig?.hostUri ||
  (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
  (Constants as any)?.manifest?.debuggerHost;
export const isPhysicalDevice: boolean = Boolean(Constants?.isDevice);
