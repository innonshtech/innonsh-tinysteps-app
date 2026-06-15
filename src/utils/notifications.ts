import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';
import { apiClient } from '../api/client';

export async function registerForPushNotificationsAsync() {
  let token;

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return;
  }

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });
  }

  try {
      token = await messaging().getToken();
  } catch (e) {
      console.warn("Could not get Firebase token", e);
  }

  // Optional: Send token to server if you have an endpoint for it
  /*
  try {
    await apiClient.post('/users/push-token', { token });
  } catch (e) {
    console.error('Failed to send push token to server', e);
  }
  */

  return token;
}

