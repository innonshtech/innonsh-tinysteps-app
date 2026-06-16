/**
 * App.tsx — Root Application Component
 * ──────────────────────────────────────
 * Firebase background message handler MUST be registered at the module
 * level (before any React component renders) as per Firebase docs.
 *
 * Full FCM lifecycle:
 *  1. setBackgroundMessageHandler — handles messages in background/killed state
 *  2. In FCMService.initializeFCM() (called after login) — foreground handler + token
 *  3. In AppNavigator — initial notification on tap from killed state
 */

import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import BootSplash from 'react-native-bootsplash';
import messaging from '@react-native-firebase/messaging';
import { displayNotification } from './src/services/fcm.service';

// ── MUST BE TOP-LEVEL (outside any component) ────────────────────────────────
// This handler runs in a headless JS task when app is in background or terminated.
// It MUST be registered before any other code.
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[App] Background FCM message:', remoteMessage.messageId);
  // Notifee displays the notification when app is in background
  await displayNotification(remoteMessage);
});
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  React.useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
