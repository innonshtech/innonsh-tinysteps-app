import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BootSplash from 'react-native-bootsplash';
import { useNotificationStore } from '../store/notificationStore';

import { useAuthStore } from '../store/authStore';
import { BottomTabNavigator } from './BottomTabNavigator';
import { Colors } from '../constants/colors';

import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/auth/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import AnimatedSplashScreen from '../screens/auth/AnimatedSplashScreen';
import DiagnosticScreen from '../screens/auth/DiagnosticScreen';
// Miscellaneous
import ChildDetailScreen from '../screens/children/ChildDetailScreen';
import FeeDetailScreen from '../screens/fees/FeeDetailScreen';
import PayFeeScreen from '../screens/fees/PayFeeScreen';
import AttendanceScreen from '../screens/academic/AttendanceScreen';
import GalleryScreen from '../screens/misc/GalleryScreen';
import EventsScreen from '../screens/misc/EventsScreen';
import ContactSchoolScreen from '../screens/misc/ContactSchoolScreen';
import SettingsScreen from '../screens/misc/SettingsScreen';
import ChangePasswordScreen from '../screens/misc/ChangePasswordScreen';

export type RootStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
    VerifyOTP: { email: string };
    ResetPassword: { email: string; otp: string };
    Diagnostic: undefined;
    MainTabs: { screen: string; params?: any } | undefined;
    ChildDetail: { childId: string };
    FeeDetail: { transactionId: string };
    PayFee: { transactionId: string };
    Attendance: { childId: string };
    Gallery: undefined;
    Events: undefined;
    ContactSchool: undefined;
    Settings: undefined;
    ChangePassword: undefined;
    Timetable: { classId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// BootSplash is configured natively to stay visible until hidden

export const AppNavigator = () => {
    const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
    const [isSplashAnimationDone, setIsSplashAnimationDone] = useState(false);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading) {
            BootSplash.hide({ fade: true });
        }
    }, [isLoading]);

    if (isLoading || !isSplashAnimationDone) {
        return <AnimatedSplashScreen onAnimationComplete={() => setIsSplashAnimationDone(true)} />;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: Colors.white,
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                {!isAuthenticated ? (
                    // Auth Flow
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="VerifyOTP"
                            component={VerifyOTPScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ResetPassword"
                            component={ResetPasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Diagnostic"
                            component={DiagnosticScreen}
                            options={{ headerShown: true, title: 'Diagnostics' }}
                        />
                    </>
                ) : (
                    // Main App Flow
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={BottomTabNavigator}
                            options={{ headerShown: false }}
                        />

                        {/* Core Details */}
                        <Stack.Screen name="ChildDetail" component={ChildDetailScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="FeeDetail" component={FeeDetailScreen} options={{ title: 'Fee Details' }} />
                        <Stack.Screen name="PayFee" component={PayFeeScreen} options={{ title: 'Payment securely' }} />

                        {/* Academics */}
                        <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />

                        {/* Misc */}
                        <Stack.Screen name="ContactSchool" component={ContactSchoolScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Gallery" component={GalleryScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer >
    );
};

