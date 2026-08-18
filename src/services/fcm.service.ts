/**
 * src/services/fcm.service.ts
 * ────────────────────────────
 * Mobile-side Firebase Cloud Messaging service.
 * Handles:
 *  - Permission request (Android 13+ requires explicit grant)
 *  - Token retrieval and registration with ERP backend
 *  - Token refresh listener
 *  - Foreground message listener (shows Notifee notification)
 *  - Background message handler setup
 *
 * Compatible with:
 *   @react-native-firebase/messaging v24
 *   @notifee/react-native v9
 */

import messaging from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  NotificationAndroid,
  NotificationIOS,
  EventType,
} from '@notifee/react-native';
import { Platform, PermissionsAndroid, Permission } from 'react-native';
import { apiClient } from '../api/client';
import { handleNotificationOpen } from './notification.handler';


// ── Android Notification Channels ────────────────────────────────────────────
// Each category gets its own channel for granular user control in Settings
export const NOTIFICATION_CHANNELS = {
  tinysteps_general:    { id: 'tinysteps_general',    name: 'General',       importance: AndroidImportance.DEFAULT },
  tinysteps_holiday:    { id: 'tinysteps_holiday',    name: 'Holidays',      importance: AndroidImportance.HIGH    },
  tinysteps_sports:     { id: 'tinysteps_sports',     name: 'Sports Events', importance: AndroidImportance.DEFAULT },
  tinysteps_academic:   { id: 'tinysteps_academic',   name: 'Academic',      importance: AndroidImportance.HIGH    },
  tinysteps_exam:       { id: 'tinysteps_exam',       name: 'Examinations',  importance: AndroidImportance.HIGH    },
  tinysteps_fee:        { id: 'tinysteps_fee',        name: 'Fee Reminders', importance: AndroidImportance.HIGH    },
  tinysteps_circular:   { id: 'tinysteps_circular',   name: 'Circulars',     importance: AndroidImportance.DEFAULT },
  tinysteps_emergency:  { id: 'tinysteps_emergency',  name: 'Emergency',     importance: AndroidImportance.HIGH    },
  tinysteps_attendance: { id: 'tinysteps_attendance', name: 'Attendance',    importance: AndroidImportance.HIGH    },
} as const;

// ── Initialization ────────────────────────────────────────────────────────────

/**
 * Call once after app startup and user login.
 * Creates all notification channels, requests permission,
 * gets token, and registers it with the backend.
 */
export async function initializeFCM(): Promise<string | null> {
  try {
    // 1. Create Android notification channels
    await createNotificationChannels();

    // 2. Request permission
    const granted = await requestPermission();
    if (!granted) {
      console.log('[FCMService] Notification permission denied');
      return null;
    }

    // 3. Get FCM token
    const token = await getToken();
    if (!token) return null;

    // 4. Register token with ERP backend
    await registerToken(token);

    // 5. Listen for token refresh
    setupTokenRefreshListener();

    return token;
  } catch (error) {
    console.error('[FCMService] initializeFCM error:', error);
    return null;
  }
}

/**
 * Create all notification channels on Android.
 * Safe to call multiple times — Notifee is idempotent.
 */
export async function createNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  for (const channel of Object.values(NOTIFICATION_CHANNELS)) {
    await notifee.createChannel({
      id: channel.id,
      name: channel.name,
      importance: channel.importance,
      vibration: true,
      lights: true,
      lightColor: '#68047d', // Innonsh brand purple
    });
  }
}

// ── Permission ────────────────────────────────────────────────────────────────

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const { AuthorizationStatus } = messaging;
    return (
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL
    );
  }

  // Android 13+ (API 33+) requires explicit POST_NOTIFICATIONS permission
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    // POST_NOTIFICATIONS was added in RN 0.71+ type definitions
    // Use string cast for older typings compatibility
    const POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS' as Permission;
    const result = await PermissionsAndroid.request(POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  // Below Android 13 — permission granted implicitly
  return true;
}

// ── Token Management ──────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  try {
    const token = await messaging().getToken();
    console.log('[FCMService] FCM Token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('[FCMService] Failed to get FCM token:', error);
    return null;
  }
}

/**
 * Register or update FCM token on ERP backend.
 * Called on login and after token refresh.
 */
export async function registerToken(token: string): Promise<void> {
  try {
    await apiClient.post('/fcm/register', {
      token,
      platform: Platform.OS,
      appVersion: '1.0.0',
    });
    console.log('[FCMService] Token registered with backend');
  } catch (error) {
    console.error('[FCMService] Token registration failed:', error);
    // Non-fatal — push will still work if old token is valid
  }
}

/**
 * Unregister token when user logs out.
 * Prevents push delivery to unauthenticated sessions.
 */
export async function unregisterToken(token?: string): Promise<void> {
  try {
    if (token) {
      await apiClient.delete(`/fcm/unregister?token=${encodeURIComponent(token)}`);
    } else {
      await apiClient.delete('/fcm/unregister');
    }
    console.log('[FCMService] Token unregistered');
  } catch (error) {
    console.error('[FCMService] Token unregister failed:', error);
  }
}

/**
 * Listen for token refresh events.
 * Firebase rotates tokens periodically or when:
 * - App is restored to a new device
 * - User clears app data
 * - FCM server invalidates the token
 */
export function setupTokenRefreshListener(): () => void {
  const unsubscribe = messaging().onTokenRefresh(async (newToken: string) => {
    console.log('[FCMService] Token refreshed');
    try {
      const oldToken = await messaging().getToken().catch(() => undefined);
      await apiClient.put('/fcm/refresh', {
        oldToken,
        newToken,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('[FCMService] Token refresh registration failed:', error);
    }
  });
  return unsubscribe;
}

// ── Foreground Message Handler ────────────────────────────────────────────────

/**
 * Handle messages received while the app is in the foreground.
 * Firebase does NOT auto-show notifications in foreground — Notifee handles this.
 * Call this inside a useEffect in AppNavigator.
 */
export function setupForegroundMessageHandler(): () => void {
  const unsubscribe = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('[FCMService] Foreground message:', remoteMessage.messageId);
      await displayNotification(remoteMessage);
    }
  );
  return unsubscribe;
}

/**
 * Display a rich notification via Notifee from a Firebase RemoteMessage.
 * Used for foreground messages and explicit background display.
 */
export async function displayNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  const { notification, data } = remoteMessage;

  const title = notification?.title ?? 'Innonsh TinySteps';
  const body = notification?.body ?? '';
  const channelId = (data?.channelId as string | undefined) ?? 'tinysteps_general';

  // Safely extract image URL — it may come from data payload
  const imageUrl: string | undefined =
    (data?.imageUrl as string | undefined) ?? undefined;

  // Build strongly-typed Android config
  const androidConfig: NotificationAndroid = {
    channelId,
    smallIcon: 'ic_notification', // must exist in android/app/src/main/res/drawable/
    color: '#68047d',
    pressAction: { id: 'default' },
    importance: AndroidImportance.HIGH,
    showTimestamp: true,
  };

  // Add big picture style only when an image URL is present
  if (imageUrl) {
    androidConfig.style = {
      type: AndroidStyle.BIGPICTURE,
      picture: imageUrl,
    };
  }

  // Build iOS config
  const iosConfig: NotificationIOS = {
    sound: 'default',
    badgeCount: 1,
  };

  const notifeePayload = {
    title,
    body,
    data: (data as Record<string, string>) ?? {},
    android: androidConfig,
    ios: iosConfig,
  };

  await notifee.displayNotification(notifeePayload);

  // Report delivery to backend (fire-and-forget)
  const notificationId = data?.notificationId as string | undefined;
  if (notificationId) {
    apiClient
      .post('/notifications/delivery', { notificationId, status: 'delivered' })
      .catch(() => {});
  }
}

// ── Notifee Foreground Event Handler (tap handling) ──────────────────────────

/**
 * Listen for notification tap events while app is in foreground.
 * Returns the unsubscribe function — call in useEffect cleanup.
 */
export function setupNotifeeEventHandler(): () => void {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      const data = detail.notification?.data as Record<string, string> | undefined;
      if (data) {
        handleNotificationOpen(data);
      }
    }
  });
}
