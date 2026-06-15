import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Users, CreditCard, Bell, User as UserIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Typography } from '../components/ui/Typography';
import { useNotificationStore } from '../store/notificationStore';
import { apiClient } from '../api/client';

// Tab Screens
import HomeScreen from '../screens/main/HomeScreen';
import ChildrenScreen from '../screens/main/ChildrenScreen';
import FeesScreen from '../screens/main/FeesScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

export type BottomTabParamList = {
    Home: undefined;
    Children: undefined;
    Fees: undefined;
    Notifications: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabBarItem = ({ label, icon: Icon, isFocused, onPress, badgeCount }: any) => {
    // Animations
    const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isFocused ? 1 : 0,
            friction: 7,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, [isFocused]);

    const activeColor = Colors.primary;
    const inactiveColor = Colors.textSecondary;
    const color = isFocused ? activeColor : inactiveColor;

    return (
        <TouchableOpacity
            style={styles.tabButton}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconWrapper}>
                {/* Active Circular Background */}
                <Animated.View
                    style={[
                        styles.activeIndicator,
                        {
                            opacity: scaleAnim,
                            transform: [{ scale: scaleAnim }],
                            backgroundColor: `${activeColor}15`
                        }
                    ]}
                />
                <Icon color={color} size={22} />
                {badgeCount > 0 && (
                    <View style={styles.badge}>
                        <Typography variant="label" weight="bold" color={Colors.white} style={{ fontSize: 8 }}>
                            {badgeCount > 9 ? '9+' : badgeCount}
                        </Typography>
                    </View>
                )}
            </View>

            <View style={styles.labelWrapper}>
                <Typography variant="label" weight={isFocused ? "bold" : "medium"} color={color} style={{ fontSize: 10, textAlign: 'center' }}>
                    {label}
                </Typography>
            </View>
        </TouchableOpacity>
    );
};

const CustomTabBar = ({ state, descriptors, navigation, insets }: BottomTabBarProps & { insets: any }) => {
    const unreadCount = useNotificationStore(state => state.unreadCount);

    return (
        <View style={[styles.tabBarContainer, { bottom: Math.max(insets.bottom, 16) }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                let IconComponent;
                switch (route.name) {
                    case 'Home': IconComponent = Home; break;
                    case 'Children': IconComponent = Users; break;
                    case 'Fees': IconComponent = CreditCard; break;
                    case 'Notifications': IconComponent = Bell; break;
                    case 'Profile': IconComponent = UserIcon; break;
                    default: IconComponent = Home;
                }

                return (
                    <TabBarItem
                        key={route.key}
                        label={label as string}
                        icon={IconComponent}
                        isFocused={isFocused}
                        onPress={onPress}
                        badgeCount={route.name === 'Notifications' ? unreadCount : 0}
                    />
                );
            })}
        </View>
    );
};

export const BottomTabNavigator = () => {
    const insets = useSafeAreaInsets();
    const fetchUnreadCount = useNotificationStore(state => state.fetchUnreadCount);

    useEffect(() => {
        fetchUnreadCount();
        // Poll every 5 seconds for more responsive updates
        const interval = setInterval(fetchUnreadCount, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} insets={insets} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
            <Tab.Screen name="Children" component={ChildrenScreen} options={{ tabBarLabel: 'Children' }} />
            <Tab.Screen name="Fees" component={FeesScreen} options={{ tabBarLabel: 'Fees' }} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: 'Alerts' }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        left: 20,
        right: 20,
        height: 64,
        borderRadius: 32,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    activeIndicator: {
        position: 'absolute',
        width: 44,
        height: 32,
        borderRadius: 16,
    },
    labelWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: Colors.error,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: Colors.white,
    }
});

