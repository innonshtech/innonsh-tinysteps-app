import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { InnonshColors } from '../../theme/colors';
import { Typography } from '../ui/Typography';
import { InnonshShadows } from '../../theme/shadows';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    dynamicTopInset?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = true,
    rightAction,
    dynamicTopInset = true,
}) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: dynamicTopInset ? insets.top : 20 }]}>
            <LinearGradient
                colors={[InnonshColors.primary, InnonshColors.primaryDark]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Abstract shapes for depth */}
            <View style={styles.headerShape1} />
            <View style={styles.headerShape2} />

            <View style={styles.content}>
                <View style={styles.leftSection}>
                    {showBack && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <ChevronLeft color={InnonshColors.surface} size={28} />
                        </TouchableOpacity>
                    )}
                    <Typography
                        variant="h3"
                        color={InnonshColors.surface}
                        style={[styles.title, showBack ? { marginLeft: 8 } : null]}
                        numberOfLines={1}
                    >
                        {title}
                    </Typography>
                </View>
                <View style={styles.rightSection}>
                    {rightAction}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        ...InnonshShadows.md,
    },
    headerShape1: {
        position: 'absolute',
        top: -40,
        right: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerShape2: {
        position: 'absolute',
        bottom: -30,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 4,
    },
    title: {
        flex: 1,
    },
    rightSection: {
        marginLeft: 16,
    },
});

