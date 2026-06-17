import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
import { apiClient } from '../../api/client';

export default function ChangePasswordScreen() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New password and confirm password do not match');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.put('/auth/profile', {
                oldPassword,
                password: newPassword,
            });

            if (response.data?.success || response.status === 200) {
                Alert.alert('Success', 'Your password has been changed successfully.', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            console.error('ChangePassword error:', error);
            let msg = 'Failed to change password. Please try again.';
            
            if (error.response) {
                msg = error.response.data?.message || error.response.data?.error || `Error: ${error.response.status}`;
            } else if (error.request) {
                msg = 'No response from server. Please check your internet connection.';
            }
            
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={[styles.headerBg, { height: insets.top + 160 }]}>
                <LinearGradient
                    colors={[InnonshColors.primary, InnonshColors.primaryDark]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.headerShape1} />
                <View style={styles.headerShape2} />
            </View>

            <AppHeader title="Change Password" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    
                    <Typography variant="body" color={InnonshColors.textSecondary} style={styles.instructionText}>
                        Please enter your current password to create a new one. Your new password must be at least 8 characters long.
                    </Typography>

                    <View style={styles.inputWrapper}>
                        <Typography variant="caption" color={InnonshColors.textSecondary} style={styles.inputLabel}>
                            Old Password
                        </Typography>
                        <View style={styles.inputContainer}>
                            <Lock color={InnonshColors.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={InnonshColors.textSecondary}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                {showPassword ? <EyeOff color={InnonshColors.textSecondary} size={20} /> : <Eye color={InnonshColors.textSecondary} size={20} />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Typography variant="caption" color={InnonshColors.textSecondary} style={styles.inputLabel}>
                            New Password
                        </Typography>
                        <View style={styles.inputContainer}>
                            <Lock color={InnonshColors.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={InnonshColors.textSecondary}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrapper}>
                        <Typography variant="caption" color={InnonshColors.textSecondary} style={styles.inputLabel}>
                            Confirm New Password
                        </Typography>
                        <View style={styles.inputContainer}>
                            <Lock color={InnonshColors.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor={InnonshColors.textSecondary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <Button
                        title="Update Password"
                        onPress={handleChangePassword}
                        size="large"
                        loading={loading}
                        style={styles.actionButton}
                    />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: InnonshColors.background,
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        overflow: 'hidden',
    },
    headerShape1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255,255,255,0.08)',
        top: -100,
        right: -50,
    },
    headerShape2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -50,
        left: -50,
    },
    scrollContent: {
        padding: InnonshSpacing.lg,
        paddingBottom: 40,
    },
    formCard: {
        backgroundColor: InnonshColors.surface,
        borderRadius: InnonshRadius.xl,
        padding: InnonshSpacing.xl,
        ...InnonshShadows.lg,
    },
    instructionText: {
        marginBottom: InnonshSpacing.lg,
        textAlign: 'center',
        lineHeight: 20,
    },
    inputWrapper: {
        marginBottom: InnonshSpacing.lg,
    },
    inputLabel: {
        marginBottom: InnonshSpacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: InnonshColors.background,
        borderWidth: 1,
        borderColor: InnonshColors.border,
        borderRadius: InnonshRadius.md,
        paddingHorizontal: InnonshSpacing.md,
        height: 56,
    },
    inputIcon: {
        marginRight: InnonshSpacing.md,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: InnonshColors.textPrimary,
        fontFamily: 'GoogleSans-Medium',
    },
    eyeIcon: {
        padding: InnonshSpacing.sm,
    },
    actionButton: {
        marginTop: 12,
        height: 56,
        borderRadius: InnonshRadius.md,
    }
});

