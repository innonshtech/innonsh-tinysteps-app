import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
import { Typography } from '../ui/Typography';

interface QuickActionCardProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    style?: ViewStyle;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
    icon,
    label,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.container, style]}
            onPress={onPress}
        >
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Typography variant="caption" align="center" style={styles.label}>
                {label}
            </Typography>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: InnonshColors.surface,
        borderRadius: InnonshRadius.lg,
        padding: InnonshSpacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...InnonshShadows.sm,
        flex: 1, // To let it grow in a row
        borderWidth: 1,
        borderColor: InnonshColors.border,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: InnonshColors.primaryLight + '20', // subtle background using primaryLight with opacity
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: InnonshSpacing.sm,
    },
    label: {
        color: InnonshColors.textPrimary,
    },
});

