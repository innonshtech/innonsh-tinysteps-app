import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PodarColors } from '../../theme/colors';
import { PodarShadows } from '../../theme/shadows';
import { PodarRadius, PodarSpacing } from '../../theme/spacing';
import { Typography } from './Typography';
import { PodarTypography } from '../../theme/typography';
import { Text } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
    icon,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return PodarColors.secondary;
        switch (variant) {
            case 'primary': return PodarColors.primary;
            case 'secondary': return PodarColors.surface;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return PodarColors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return PodarColors.textSecondary;
        switch (variant) {
            case 'primary': return PodarColors.surface;
            case 'secondary': return PodarColors.primary;
            case 'outline': return PodarColors.primary;
            case 'ghost': return PodarColors.primary;
            default: return PodarColors.surface;
        }
    };

    const borderStyles = variant === 'secondary' || variant === 'outline' 
        ? { borderWidth: 1, borderColor: disabled ? PodarColors.border : PodarColors.primary } 
        : {};

    const shadowStyles = (variant === 'primary' && !disabled) ? PodarShadows.sm : {};

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.container,
                styles[size],
                { backgroundColor: getBackgroundColor() },
                borderStyles,
                shadowStyles,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && icon}
                    <Text
                        style={[
                            PodarTypography.button,
                            { color: getTextColor(), textAlign: 'center' },
                            icon ? { marginLeft: PodarSpacing.sm } : null,
                            textStyle
                        ]}
                    >
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: PodarRadius.pill,
    },
    small: { paddingVertical: PodarSpacing.sm, paddingHorizontal: PodarSpacing.md },
    medium: { paddingVertical: PodarSpacing.md, paddingHorizontal: PodarSpacing.lg },
    large: { paddingVertical: PodarSpacing.lg, paddingHorizontal: PodarSpacing.xl },
});

