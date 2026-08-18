import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ChevronRight, Bell, Lock, Globe, Shield, Info, HelpCircle } from 'lucide-react-native';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
import { useSettingsStore } from '../../store/settingsStore';

export default function SettingsScreen() {
    const { pushNotificationsEnabled, setPushNotifications } = useSettingsStore();

    const renderSettingRow = (
        icon: React.ReactNode,
        title: string,
        onPress?: () => void,
        rightElement?: React.ReactNode
    ) => (
        <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Typography variant="body" color={InnonshColors.textPrimary} style={styles.title}>
                {title}
            </Typography>
            <View style={styles.rightContainer}>
                {rightElement || <ChevronRight size={20} color={InnonshColors.border} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <AppHeader title="Settings" showBack />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Typography variant="label" color={InnonshColors.textSecondary} style={styles.sectionHeader}>
                    NOTIFICATIONS
                </Typography>
                <View style={styles.card}>
                    {renderSettingRow(
                        <Bell size={20} color={InnonshColors.primary} />,
                        'Push Notifications',
                        undefined,
                        <Switch
                            value={pushNotificationsEnabled}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: '#D1D5DB', true: InnonshColors.primaryLight }}
                            thumbColor={pushNotificationsEnabled ? InnonshColors.primary : '#F4F3F4'}
                        />
                    )}
                </View>

                <Typography variant="label" color={InnonshColors.textSecondary} style={styles.sectionHeader}>
                    SECURITY & PRIVACY
                </Typography>
                <View style={styles.card}>
                    {renderSettingRow(
                        <Lock size={20} color={InnonshColors.warning} />,
                        'Change Password',
                        () => Alert.alert('Change Password', 'Password reset flow would start here.')
                    )}
                    <View style={styles.divider} />
                    {renderSettingRow(
                        <Shield size={20} color={'#8B5CF6'} />,
                        'Privacy Policy',
                        () => Alert.alert('Privacy Policy', 'Opening privacy policy...')
                    )}
                </View>

                <Typography variant="label" color={InnonshColors.textSecondary} style={styles.sectionHeader}>
                    GENERAL
                </Typography>
                <View style={styles.card}>
                    {renderSettingRow(
                        <Globe size={20} color={'#10B981'} />,
                        'Language',
                        () => Alert.alert('Language', 'Current: English (India)')
                    )}
                    <View style={styles.divider} />
                    {renderSettingRow(
                        <HelpCircle size={20} color={InnonshColors.secondary} />,
                        'Help & Support',
                        () => Alert.alert('Support', 'Contacting support...')
                    )}
                    <View style={styles.divider} />
                    {renderSettingRow(
                        <Info size={20} color={InnonshColors.textSecondary} />,
                        'About App',
                        () => Alert.alert('About', 'Innonsh TinySteps Parent App\nVersion 1.0.0 (Build 12)')
                    )}
                </View>

                <Typography variant="caption" color={InnonshColors.textSecondary} align="center" style={styles.footerText}>
                    Made with ❤️ by Innonsh Education
                </Typography>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: InnonshColors.background,
    },
    scrollContent: {
        padding: InnonshSpacing.lg,
    },
    sectionHeader: {
        marginBottom: InnonshSpacing.sm,
        marginLeft: 4,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: InnonshColors.surface,
        borderRadius: InnonshRadius.lg,
        marginBottom: InnonshSpacing.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: InnonshColors.border,
        ...InnonshShadows.sm,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: InnonshSpacing.lg,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: InnonshRadius.md,
        backgroundColor: InnonshColors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: InnonshSpacing.md,
    },
    title: {
        flex: 1,
    },
    rightContainer: {
        marginLeft: InnonshSpacing.sm,
    },
    divider: {
        height: 1,
        backgroundColor: InnonshColors.background,
        marginLeft: 64,
    },
    footerText: {
        marginTop: InnonshSpacing.lg,
        marginBottom: 40,
        opacity: 0.5,
    }
});

