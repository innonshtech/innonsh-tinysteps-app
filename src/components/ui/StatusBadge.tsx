import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from './Typography';

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
    label: string;
    status?: BadgeStatus;
    style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    label,
    status = 'default',
    style,
}) => {
    const getColors = () => {
        switch (status) {
            case 'success':
                return { bg: '#D1FAE5', text: Colors.secondary }; // emerald-100 to emerald-500
            case 'warning':
                return { bg: '#FEF3C7', text: Colors.warning }; // amber-100 to amber-500
            case 'error':
                return { bg: '#FEE2E2', text: Colors.error }; // red-100 to red-500
            case 'info':
                return { bg: '#DBEAFE', text: '#3B82F6' }; // blue-100 to blue-500
            default:
                return { bg: Colors.border, text: Colors.textSecondary };
        }
    };

    const colors = getColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }, style]}>
            <Typography variant="label" weight="medium" style={{ color: colors.text }}>
                {label.toUpperCase()}
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
});

