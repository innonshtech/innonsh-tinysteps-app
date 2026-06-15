import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { PodarColors } from '../../theme/colors';
import { PodarSpacing, PodarRadius } from '../../theme/spacing';
import { PodarShadows } from '../../theme/shadows';
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
    color = PodarColors.primary,
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
                {icon}
            </View>
            <View style={styles.content}>
                <Typography variant="h2" color={PodarColors.textPrimary}>
                    {value}
                </Typography>
                <Typography variant="caption" color={PodarColors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
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
        backgroundColor: PodarColors.surface,
        borderRadius: PodarRadius.lg,
        padding: PodarSpacing.md,
        ...PodarShadows.sm,
        borderWidth: 1,
        borderColor: PodarColors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: PodarSpacing.sm,
    },
    content: {
        flex: 1,
    },
});

