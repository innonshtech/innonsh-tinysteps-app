import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { InnonshColors } from '../../theme/colors';
import { InnonshShadows } from '../../theme/shadows';
import { InnonshRadius, InnonshSpacing } from '../../theme/spacing';
import { Typography } from './Typography';
import { InnonshTypography } from '../../theme/typography';
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
        if (disabled) return InnonshColors.secondary;
        switch (variant) {
            case 'primary': return InnonshColors.primary;
            case 'secondary': return InnonshColors.surface;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return InnonshColors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return InnonshColors.textSecondary;
        switch (variant) {
            case 'primary': return InnonshColors.surface;
            case 'secondary': return InnonshColors.primary;
            case 'outline': return InnonshColors.primary;
            case 'ghost': return InnonshColors.primary;
            default: return InnonshColors.surface;
        }
    };

    const borderStyles = variant === 'secondary' || variant === 'outline' 
        ? { borderWidth: 1, borderColor: disabled ? InnonshColors.border : InnonshColors.primary } 
        : {};

    const shadowStyles = (variant === 'primary' && !disabled) ? InnonshShadows.sm : {};

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
                            InnonshTypography.button,
                            { color: getTextColor(), textAlign: 'center' },
                            icon ? { marginLeft: InnonshSpacing.sm } : null,
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
        borderRadius: InnonshRadius.pill,
    },
    small: { paddingVertical: InnonshSpacing.sm, paddingHorizontal: InnonshSpacing.md },
    medium: { paddingVertical: InnonshSpacing.md, paddingHorizontal: InnonshSpacing.lg },
    large: { paddingVertical: InnonshSpacing.lg, paddingHorizontal: InnonshSpacing.xl },
});

