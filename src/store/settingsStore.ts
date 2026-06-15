import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
    pushNotificationsEnabled: boolean;
    setPushNotifications: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            pushNotificationsEnabled: true,
            setPushNotifications: (enabled: boolean) => set({ pushNotificationsEnabled: enabled }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

