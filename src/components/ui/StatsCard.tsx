import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
import { Typography } from '../ui/Typography';

interface StatsCardProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color?: string;
    style?: ViewStyle;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    value,
    label,
    color = InnonshColors.primary,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                {icon}
            </View>
            <View style={styles.content}>
                <Typography variant="h2" color={InnonshColors.textPrimary}>
                    {value}
                </Typography>
                <Typography variant="caption" color={InnonshColors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
                    {label}
                </Typography>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: InnonshColors.surface,
        borderRadius: InnonshRadius.lg,
        padding: InnonshSpacing.md,
        ...InnonshShadows.sm,
        borderWidth: 1,
        borderColor: InnonshColors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: InnonshSpacing.sm,
    },
    content: {
        flex: 1,
    },
});

