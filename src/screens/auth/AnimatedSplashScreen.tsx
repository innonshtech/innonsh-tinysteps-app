import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { InnonshColors } from '../../theme/colors';
import { Typography } from '../../components/ui/Typography';

const { width, height } = Dimensions.get('window');

interface Props {
    onAnimationComplete: () => void;
}

export default function AnimatedSplashScreen({ onAnimationComplete }: Props) {
    const scaleAnim = useRef(new Animated.Value(0.4)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    
    // Background animations
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;
    const floatAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Background floating elements
        const createFloatAnimation = (anim: Animated.Value, duration: number, delay: number = 0) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true })
                ])
            );
        };

        createFloatAnimation(floatAnim1, 4000).start();
        createFloatAnimation(floatAnim2, 5000, 500).start();
        createFloatAnimation(floatAnim3, 6000, 1000).start();

        // Main entrance sequence
        Animated.sequence([
            // 1. Zoom in and fade in the logo
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 15,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            // 2. Fade in the text with a slight delay
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            // 3. Pause longer to let them read it
            Animated.delay(1200),
            // 4. Exit animation
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 1.15,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(textFadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            onAnimationComplete();
        });
    }, []);

    const floatInterpolate1 = floatAnim1.interpolate({ inputRange: [0, 1], outputRange: [0, -30] });
    const floatInterpolate2 = floatAnim2.interpolate({ inputRange: [0, 1], outputRange: [0, 40] });
    const floatInterpolate3 = floatAnim3.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[InnonshColors.primary, '#4a148c', '#311b92']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Decorative background shapes */}
            <Animated.View style={[styles.bgShape1, { transform: [{ translateY: floatInterpolate1 }] }]} />
            <Animated.View style={[styles.bgShape2, { transform: [{ translateY: floatInterpolate2 }] }]} />
            <Animated.View style={[styles.bgShape3, { transform: [{ translateY: floatInterpolate3 }, { scale: 1.2 }] }]} />

            <View style={styles.content}>
                <Animated.View
                    style={[
                        styles.logoWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <View style={styles.logoGlow} />
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../../assets/images/ICON.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>

                <Animated.View style={[{ opacity: textFadeAnim }, styles.textContainer]}>
                    <Typography variant="display" color={InnonshColors.surface} style={styles.brandName}>
                        Innonsh
                    </Typography>
                    <Typography variant="h2" color="#e1bee7" style={styles.appName}>
                        TINYSTEPS
                    </Typography>
                    <View style={styles.divider} />
                    <Typography variant="caption" color="rgba(255,255,255,0.6)" style={styles.tagline}>
                        PREMIUM EARLY EDUCATION
                    </Typography>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: InnonshColors.primaryDark,
        overflow: 'hidden',
    },
    bgShape1: {
        position: 'absolute',
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: -height * 0.1,
        right: -width * 0.2,
    },
    bgShape2: {
        position: 'absolute',
        width: width * 0.6,
        height: width * 0.6,
        borderRadius: width * 0.3,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        bottom: height * 0.05,
        left: -width * 0.2,
    },
    bgShape3: {
        position: 'absolute',
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: width * 0.25,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        top: height * 0.4,
        right: width * 0.1,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    logoGlow: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        transform: [{ scale: 1.2 }],
    },
    logoContainer: {
        width: 140,
        height: 140,
        borderRadius: 36,
        backgroundColor: InnonshColors.surface,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 20,
        padding: 4, // slight inset
    },
    logo: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
    },
    textContainer: {
        alignItems: 'center',
    },
    brandName: {
        letterSpacing: 1,
        marginBottom: -4,
    },
    appName: {
        letterSpacing: 4,
        marginBottom: 16,
    },
    divider: {
        width: 40,
        height: 3,
        backgroundColor: '#e1bee7',
        borderRadius: 2,
        marginBottom: 16,
    },
    tagline: {
        letterSpacing: 3,
        fontSize: 12,
    }
});

