import React, { useState, useEffect, useRef } from 'react';
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
    Dimensions,
    Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ShieldCheck, ArrowLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { apiClient } from '../../api/client';

const { width, height } = Dimensions.get('window');

export default function VerifyOTPScreen() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { email } = route.params || {};

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideYAnim = useRef(new Animated.Value(50)).current;
    const inputSlide = useRef(new Animated.Value(30)).current;
    const btnSlide = useRef(new Animated.Value(30)).current;
    const floatAnim1 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideYAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
            Animated.stagger(100, [
                Animated.spring(inputSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
                Animated.spring(btnSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
            ])
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim1, { toValue: 1, duration: 4000, useNativeDriver: true }),
                Animated.timing(floatAnim1, { toValue: 0, duration: 4000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 4) {
            Alert.alert('Error', 'Please enter a valid OTP');
            return;
        }

        try {
            setLoading(true);
            // Assuming endpoint for verification
            const response = await apiClient.post('/auth/verify-otp', {
                email,
                otp: otp.trim(),
            });

            // Navigate to reset password screen with the OTP or a verification token
            navigation.navigate('ResetPassword', { email, otp: otp.trim() });
        } catch (error: any) {
            console.error('VerifyOTP error:', error);
            const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        try {
            setLoading(true);
            await apiClient.post('/auth/forgot-password', { email });
            Alert.alert('Success', 'A new OTP has been sent to your email.');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to resend OTP';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const floatInterpolate1 = floatAnim1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15],
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
                <View style={styles.topBgContainer}>
                    <LinearGradient
                        colors={[Colors.primary, '#3730A3']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />

                    <Animated.View style={[styles.bgShape1, { transform: [{ translateY: floatInterpolate1 }] }]} />
                    <View style={styles.bgShape2} />

                    <View style={[styles.headerHero, { paddingTop: insets.top + 20 }]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <ArrowLeft color={Colors.white} size={24} />
                        </TouchableOpacity>

                        <View style={styles.logoRow}>
                            <View style={styles.logoPlaceholder}>
                                <Image source={require('../../../assets/images/logo2.jpg')} style={styles.logoImage} />
                            </View>
                        </View>

                        <Animated.View style={{ opacity: fadeAnim }}>
                            <Typography variant="h1" weight="bold" color={Colors.white} style={styles.welcomeText}>
                                Verify OTP
                            </Typography>
                            <Typography variant="body" color="rgba(255,255,255,0.8)">
                                We've sent a 6-digit code to {email}.
                            </Typography>
                        </Animated.View>
                    </View>
                </View>

                <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideYAnim }] }]}>
                    <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: inputSlide }] }]}>
                        <Typography variant="caption" weight="medium" color={Colors.textSecondary} style={styles.inputLabel}>
                            Enter OTP
                        </Typography>
                        <View style={styles.inputContainer}>
                            <ShieldCheck color={Colors.primary} size={20} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="000000"
                                placeholderTextColor={Colors.border}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                                maxLength={6}
                                autoCapitalize="none"
                            />
                        </View>
                    </Animated.View>

                    <Animated.View style={{ transform: [{ translateY: btnSlide }] }}>
                        <Button
                            title="Verify & Proceed"
                            onPress={handleVerifyOTP}
                            size="large"
                            loading={loading}
                            style={styles.actionButton}
                        />
                    </Animated.View>

                    <TouchableOpacity
                        onPress={handleResendOTP}
                        style={styles.resendContainer}
                        disabled={loading}
                    >
                        <Typography variant="body" color={Colors.textSecondary}>
                            Didn't receive code? {' '}
                            <Typography variant="body" weight="bold" color={Colors.primary}>
                                Resend
                            </Typography>
                        </Typography>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
    },
    topBgContainer: {
        height: height * 0.4,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
        position: 'relative',
        paddingHorizontal: 24,
    },
    bgShape1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: -50,
        right: -80,
    },
    bgShape2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#8B5CF6',
        opacity: 0.15,
        bottom: -30,
        left: -40,
    },
    headerHero: {
        flex: 1,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    formCard: {
        backgroundColor: Colors.white,
        borderRadius: 32,
        marginHorizontal: 24,
        padding: 32,
        marginTop: -60,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    inputWrapper: {
        marginBottom: 32,
    },
    inputLabel: {
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 24,
        color: Colors.textPrimary,
        fontFamily: 'Inter-Bold',
        letterSpacing: 8,
        textAlign: 'center',
    },
    actionButton: {
        height: 56,
        borderRadius: 16,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
    },
    resendContainer: {
        alignItems: 'center',
        marginTop: 24,
    }
});

