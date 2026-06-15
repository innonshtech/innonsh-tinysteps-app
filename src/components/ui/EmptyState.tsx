import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { FileSearch } from 'lucide-react-native';

import { Colors } from '../../constants/colors';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface EmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    fullScreen?: boolean;
    style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No Data Found',
    message = "There's nothing to show here at the moment.",
    actionLabel,
    onAction,
    fullScreen = false,
    style,
}) => {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
            <View style={styles.iconCircle}>
                <FileSearch color={Colors.primary} size={48} />
            </View>

            <Typography variant="h3" weight="semiBold" align="center" style={styles.title}>
                {title}
            </Typography>

            <Typography variant="body" color={Colors.textSecondary} align="center" style={styles.message}>
                {message}
            </Typography>

            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="outline"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullScreen: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#EEF2FF', // indigo-50
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
    },
    message: {
        marginBottom: 32,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    button: {
        minWidth: 160,
    },
});

