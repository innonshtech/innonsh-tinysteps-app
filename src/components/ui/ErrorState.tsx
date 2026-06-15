import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

import { Colors } from '../../constants/colors';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry: () => void;
    fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message = 'We encountered an error while loading this data. Please try again.',
    onRetry,
    fullScreen = false,
}) => {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <AlertCircle color={Colors.error} size={64} style={styles.icon} />

            <Typography variant="h3" weight="semiBold" align="center" style={styles.title}>
                {title}
            </Typography>

            <Typography variant="body" color={Colors.textSecondary} align="center" style={styles.message}>
                {message}
            </Typography>

            <Button
                title="Try Again"
                onPress={onRetry}
                variant="outline"
                style={styles.button}
            />
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
    icon: {
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
    },
    message: {
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    button: {
        minWidth: 160,
    },
});

