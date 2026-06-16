/**
 * src/services/notification.handler.ts
 * ──────────────────────────────────────
 * Handles navigation when a push notification is tapped.
 * Works for both foreground (Notifee tap) and background/killed app
 * (Firebase initial notification).
 *
 * Deep link mapping:
 *  - screen=Events         → navigate to Events screen
 *  - screen=Notifications  → navigate to Notifications tab
 *  - screen=Fees           → navigate to Fees tab
 *  - screen=Attendance     → navigate to Attendance screen
 *  - (default)             → navigate to Notifications tab
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import { apiClient } from '../api/client';

// Global navigation ref — used by notification handler to navigate on tap.
// Passed as `ref={navigationRef}` to <NavigationContainer> in AppNavigator.tsx
export const navigationRef = createNavigationContainerRef<any>();

export interface NotificationData {
  screen?: string;
  notificationId?: string;
  eventId?: string;
  eventType?: string;
  category?: string;
  childId?: string;
  transactionId?: string;
  [key: string]: string | undefined;
}

/**
 * Call this when user taps a notification (foreground or background).
 * Navigates to the appropriate screen based on notification data.
 */
export function handleNotificationOpen(data: NotificationData): void {
  const { screen, notificationId, eventId, childId, transactionId } = data;

  console.log('[NotificationHandler] Opening notification:', { screen, notificationId });

  // Report click to backend (fire-and-forget)
  if (notificationId) {
    apiClient
      .post('/notifications/delivery', {
        notificationId,
        status: 'clicked',
      })
      .catch(() => {});
  }

  // Navigate after a short delay to ensure NavigationContainer is ready
  setTimeout(() => {
    if (!navigationRef.current) {
      console.warn('[NotificationHandler] Navigation ref not ready');
      return;
    }

    try {
      switch (screen) {
        case 'Events':
          navigationRef.current.navigate('Events');
          break;

        case 'Fees':
          if (transactionId) {
            navigationRef.current.navigate('FeeDetail', { transactionId });
          } else {
            navigationRef.current.navigate('MainTabs', { screen: 'Fees' });
          }
          break;

        case 'Attendance':
          if (childId) {
            navigationRef.current.navigate('Attendance', { childId });
          } else {
            navigationRef.current.navigate('MainTabs', { screen: 'Children' });
          }
          break;

        case 'Notifications':
        default:
          // Navigate to Notifications tab
          navigationRef.current.navigate('MainTabs', { screen: 'Notifications' });
          break;
      }
    } catch (error) {
      console.error('[NotificationHandler] Navigation error:', error);
      // Fallback to notifications tab
      try {
        navigationRef.current?.navigate('MainTabs', { screen: 'Notifications' });
      } catch {
        // ignore
      }
    }
  }, 300);
}

/**
 * Handle initial notification — app was in killed/closed state when tapped.
 * Call this in App.tsx once on mount.
 */
export async function handleInitialNotification(): Promise<void> {
  try {
    const messaging = (await import('@react-native-firebase/messaging')).default;
    const initialNotification = await messaging().getInitialNotification();

    if (initialNotification) {
      console.log('[NotificationHandler] App opened from killed state via notification');
      const data = initialNotification.data as NotificationData;
      if (data) {
        // Delay longer for killed app (navigation takes more time to initialize)
        setTimeout(() => handleNotificationOpen(data), 1000);
      }
    }
  } catch (error) {
    console.error('[NotificationHandler] handleInitialNotification error:', error);
  }
}

/**
 * Handle background notification tap — app was in background when tapped.
 * Register this BEFORE NavigationContainer renders.
 */
export function setupBackgroundNotificationHandler(): () => void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const messagingModule = require('@react-native-firebase/messaging');
  // Support both default export patterns (CJS interop)
  const messagingFn = messagingModule.default ?? messagingModule;

  const unsubscribe = messagingFn().onNotificationOpenedApp(
    (remoteMessage: { data?: NotificationData }) => {
      console.log('[NotificationHandler] Background notification tapped');
      if (remoteMessage.data) {
        handleNotificationOpen(remoteMessage.data);
      }
    }
  );

  return unsubscribe;
}
