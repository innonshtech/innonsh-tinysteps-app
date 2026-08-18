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
  Image,
  Text
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, ArrowRight, School, ShieldCheck, Bell, Calendar as CalendarIcon, ClipboardList } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const login = useAuthStore((state) => state.login);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideYAnim = useRef(new Animated.Value(50)).current;
  const inputSlide1 = useRef(new Animated.Value(30)).current;
  const inputSlide2 = useRef(new Animated.Value(30)).current;
  const btnSlide = useRef(new Animated.Value(30)).current;
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    // Entrance Animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideYAnim, { toValue: 0, tension: 40, friction: 8, useNativeDriver: true }),
      Animated.stagger(100, [
        Animated.spring(inputSlide1, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.spring(inputSlide2, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.spring(btnSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ])
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      const response = await apiClient.post('/auth/login', {
        email: trimmedEmail,
        password: trimmedPassword,
        role: 'parent',
      });

      console.log('Login success:', response.data);

      let token = response.data.token;
      const user = response.data.user || response.data;

      if (!token && response.headers['set-cookie']) {
        const cookies = response.headers['set-cookie'];
        const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
        const tokenCookie = cookieArray.find((c: string) => c.startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split(';')[0].split('=')[1];
        }
      }

      if (!token) {
        console.error('Login Error: Token not found in response', response.data);
        throw new Error('Authentication token not found in response.');
      }

      if (!user || user.role !== 'parent') {
        console.error('Login Error: Unauthorized role or missing user', user);
        throw new Error('Not authorized. Parent access only.');
      }

      await login(token, user);

    } catch (error: any) {
      console.error('Login error detail:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      const isNetworkError = error.message === 'Network Error' || error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Invalid email or password';
      
      if (isNetworkError) {
        Alert.alert('Network Error', 'Could not connect to the backend server. Would you like to run network diagnostics?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Run Diagnostics', onPress: () => navigation.navigate('Diagnostic') }
        ]);
      } else {
        Alert.alert('Login Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleContactSchool = () => {
    Alert.alert('Contact School', 'Phone: +91 9876543210\nEmail: info@school.com');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>

        {/* Hero Header */}
        <View style={styles.heroHeader}>
          <LinearGradient
            colors={[InnonshColors.primary, InnonshColors.secondary]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          {/* Abstract pattern mock overlay */}
          <View style={styles.patternOverlay} />
          
          <Animated.View style={[styles.heroContent, { paddingTop: insets.top + 40, opacity: fadeAnim }]}>
            <View style={styles.logoShadowBox}>
              <Image 
                source={require('../../../assets/images/ICON.png')} 
                style={styles.logoImage} 
                resizeMode="contain" 
              />
            </View>
            <Text style={styles.heroTitle}>Innonsh TinySteps Parent App</Text>
            <Text style={styles.heroSubtitle}>Manage your child's learning journey effortlessly with our premium digital companion.</Text>
          </Animated.View>
        </View>

        {/* Login Section */}
        <Animated.View style={[styles.loginSection, { opacity: fadeAnim, transform: [{ translateY: slideYAnim }] }]}>
          
          {/* Login Card */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Access your parent dashboard</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Email Input */}
              <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: inputSlide1 }] }]}>
                <Text style={styles.inputLabel}>Enter registered email</Text>
                <View style={[styles.inputContainer, emailFocused && styles.inputFocused]}>
                  <Mail color={emailFocused ? InnonshColors.primary : InnonshColors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor={InnonshColors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </Animated.View>

              {/* Password Input */}
              <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: inputSlide2 }] }]}>
                <Text style={styles.inputLabel}>Enter password</Text>
                <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
                  <Lock color={passwordFocused ? InnonshColors.primary : InnonshColors.textSecondary} size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={InnonshColors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword ? (
                      <EyeOff color={InnonshColors.primary} size={20} />
                    ) : (
                      <Eye color={InnonshColors.textSecondary} size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Options Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity style={styles.rememberMeMock} activeOpacity={0.7}>
                  <View style={styles.mockCheckbox} />
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleForgotPassword} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Animated.View style={{ transform: [{ translateY: btnSlide }] }}>
                <TouchableOpacity 
                  style={styles.loginBtnWrapper} 
                  activeOpacity={0.8}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[InnonshColors.primary, InnonshColors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginBtnGradient}
                  >
                    <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login to Dashboard'}</Text>
                    {!loading && <ArrowRight color="#fff" size={20} style={{ marginLeft: 8 }} />}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Contact School */}
              <View style={styles.contactDivider}>
                <Text style={styles.contactHint}>Need help logging in?</Text>
                <TouchableOpacity 
                  style={styles.contactBtn}
                  activeOpacity={0.7}
                  onPress={handleContactSchool}
                >
                  <School color={InnonshColors.primary} size={18} />
                  <Text style={styles.contactBtnText}>Contact School</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>

          {/* Trust Section Grid */}
          <Animated.View style={[styles.trustGrid, { opacity: fadeAnim }]}>
            <View style={styles.trustCard}>
              <ShieldCheck color={InnonshColors.primary} size={28} />
              <Text style={styles.trustText}>Secure Parent{'\n'}Access</Text>
            </View>
            <View style={styles.trustCard}>
              <Bell color={InnonshColors.primary} size={28} />
              <Text style={styles.trustText}>Real-time{'\n'}Updates</Text>
            </View>
            <View style={styles.trustCard}>
              <CalendarIcon color={InnonshColors.primary} size={28} />
              <Text style={styles.trustText}>Attendance{'\n'}Tracking</Text>
            </View>
            <View style={styles.trustCard}>
              <ClipboardList color={InnonshColors.primary} size={28} />
              <Text style={styles.trustText}>Homework{'\n'}& Events</Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Powered by Innonsh Education</Text>
            <View style={styles.footerLine} />
          </Animated.View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9ff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  heroHeader: {
    width: '100%',
    paddingBottom: 100,
    borderBottomLeftRadius: 64,
    borderBottomRightRadius: 64,
    overflow: 'hidden',
    position: 'relative',
  },
  patternOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoShadowBox: {
    width: 96,
    height: 96,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  loginSection: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: -80,
    zIndex: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 32,
    padding: 32,
    shadowColor: InnonshColors.primary,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 24,
    color: InnonshColors.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 15,
    color: InnonshColors.textSecondary,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 13,
    color: InnonshColors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F1FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: InnonshColors.primary + '80',
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: InnonshColors.textPrimary,
    fontFamily: 'GoogleSans-Medium',
  },
  eyeIcon: {
    padding: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  rememberMeMock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: InnonshColors.border,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  rememberMeText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 13,
    color: InnonshColors.textSecondary,
  },
  forgotPasswordText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 13,
    color: InnonshColors.secondary,
  },
  loginBtnWrapper: {
    width: '100%',
    shadowColor: InnonshColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 6,
  },
  loginBtnGradient: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
    color: '#fff',
  },
  contactDivider: {
    marginTop: 40,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#ebeef3',
    alignItems: 'center',
  },
  contactHint: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: InnonshColors.textSecondary,
    marginBottom: 16,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: InnonshColors.primary + '30',
    backgroundColor: '#fff',
  },
  contactBtnText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 15,
    color: InnonshColors.primary,
    marginLeft: 8,
  },
  trustGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 48,
    gap: 16,
  },
  trustCard: {
    width: '47%',
    backgroundColor: 'rgba(235, 238, 243, 0.5)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  trustText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 13,
    color: InnonshColors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    marginBottom: 20,
  },
  footerLine: {
    width: 24,
    height: 1,
    backgroundColor: '#d3c1d1',
  },
  footerText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: '#817381',
    marginHorizontal: 12,
  }
});

