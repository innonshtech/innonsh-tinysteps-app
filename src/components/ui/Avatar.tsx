import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { InnonshColors } from '../../theme/colors';
import { Typography } from '../ui/Typography';

interface AvatarProps {
    name: string;
    size?: number;
    style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 48, style }) => {
    const getInitials = (fullName: string) => {
        const names = fullName.trim().split(' ');
        if (names.length === 0) return '?';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    };

    const getFontSize = () => {
        return Math.floor(size * 0.4);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: InnonshColors.primary,
                },
                style,
            ]}
        >
            <Typography
                weight="bold"
                color={Colors.white}
                style={{ fontSize: getFontSize(), lineHeight: getFontSize() + 4 }}
            >
                {getInitials(name)}
            </Typography>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
});

