import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated, Platform, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { User, Bell, Lock, HelpCircle, Shield, LogOut, ChevronRight, ChevronLeft, Phone } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../../components/ui/Typography';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/colors';
import { InnonshColors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChildStore } from '../../store/childStore';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useSettingsStore } from '../../store/settingsStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const children = useChildStore((state) => state.children);
  const { pushNotificationsEnabled, setPushNotifications } = useSettingsStore();

  // Animation values
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;

  const prefsFade = useRef(new Animated.Value(0)).current;
  const prefsSlide = useRef(new Animated.Value(30)).current;

  const supportFade = useRef(new Animated.Value(0)).current;
  const supportSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(cardFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(prefsFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(prefsSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
      ]),
      Animated.parallel([
        Animated.timing(supportFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(supportSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
      ])
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const renderSettingRow = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    iconBgColor: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingRow}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Typography variant="h4" weight="bold" color={Colors.textPrimary}>{title}</Typography>
        <Typography variant="caption" color={Colors.textSecondary} style={{ marginTop: 2 }}>{subtitle}</Typography>
      </View>
      <View style={rightElement ? styles.rightElementContainer : styles.chevronContainer}>
        {rightElement || <ChevronRight size={20} color={Colors.border} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Premium Gradient Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top || 40 }]}>
        <LinearGradient
          colors={[InnonshColors.primary, InnonshColors.primaryDark]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Abstract Background Shapes */}
        <View style={styles.headerShape1} />
        <View style={styles.headerShape2} />

      </View>

      {/* Sticky NavBar */}
      <Animated.View style={[styles.navBar, { paddingTop: (insets.top || 40) + 12, opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {navigation.canGoBack() && (
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft color={Colors.white} size={28} />
            </TouchableOpacity>
          )}
          <Typography variant="h2" weight="bold" color={Colors.white}>
            My Profile
          </Typography>
        </View>
      </Animated.View>

      <ScrollView
        style={{ zIndex: 10, elevation: 10, backgroundColor: 'transparent' }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Main Profile Card - Overlapping Header */}
        <Animated.View style={[styles.profileCard, { opacity: cardFade, transform: [{ translateY: cardSlide }] }]}>
          <View style={styles.avatarWrapper}>
            <Avatar name={user?.name || 'Parent'} size={88} style={styles.avatar} />
            <View style={styles.avatarBadge}>
              <User size={12} color={Colors.white} />
            </View>
          </View>
          <Typography variant="h2" weight="bold" color={Colors.textPrimary} style={styles.nameText}>
            {user?.name || 'Parent Name'}
          </Typography>
          <Typography variant="body" color={Colors.textSecondary} style={styles.emailText}>
            {user?.email || 'parent@example.com'}
          </Typography>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Typography variant="h3" weight="bold" color={InnonshColors.primary}>
                {children.length}
              </Typography>
              <Typography variant="caption" weight="medium" color={Colors.textSecondary}>
                {children.length === 1 ? 'Child' : 'Children'}
              </Typography>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Typography variant="h3" weight="bold" color={InnonshColors.primary}>
                Active
              </Typography>
              <Typography variant="caption" weight="medium" color={Colors.textSecondary}>
                Account Status
              </Typography>
            </View>
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View style={{ opacity: prefsFade, transform: [{ translateY: prefsSlide }] }}>
          <Typography variant="h3" weight="bold" style={styles.sectionTitle}>
            Preferences
          </Typography>
          <View style={styles.cardGroup}>
            {renderSettingRow(
              <Bell size={22} color={InnonshColors.primary} />,
              'Push Notifications',
              'Manage your alerts and daily updates',
              'rgba(131, 41, 150, 0.1)',
              undefined,
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#D1D5DB', true: InnonshColors.primary + '80' }}
                  thumbColor={pushNotificationsEnabled ? InnonshColors.primary : '#F4F3F4'}
                  ios_backgroundColor="#D1D5DB"
                />
            )}
            <View style={styles.separator} />
            {renderSettingRow(
              <Lock size={22} color={Colors.warning} />,
              'Change Password',
              'Update your security credentials',
              'rgba(245, 158, 11, 0.1)',
              () => navigation.navigate('ChangePassword')
            )}
          </View>
        </Animated.View>

        {/* Support Section */}
        <Animated.View style={{ opacity: supportFade, transform: [{ translateY: supportSlide }] }}>
          <Typography variant="h3" weight="bold" style={styles.sectionTitle}>
            Support
          </Typography>
          <View style={styles.cardGroup}>
            {renderSettingRow(
              <Phone size={22} color={'#3B82F6'} />,
              'Contact School',
              'School phone number & email',
              'rgba(59, 130, 246, 0.1)',
              () => Alert.alert('Contact School', 'Phone: +91 9876543210\nEmail: info@school.com')
            )}
            <View style={styles.separator} />
            {renderSettingRow(
              <HelpCircle size={22} color={'#10B981'} />,
              'Enquiry Form',
              'Submit an enquiry to the administration',
              'rgba(16, 185, 129, 0.1)',
              () => navigation.navigate('ContactSchool')
            )}
            <View style={styles.separator} />
            {renderSettingRow(
              <Shield size={22} color={'#8B5CF6'} />,
              'Privacy Policy',
              'Review our data handling guidelines',
              'rgba(139, 92, 246, 0.1)',
              () => Alert.alert("Privacy Policy", "Opening Privacy Policy document...")
            )}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={{ opacity: supportFade, transform: [{ translateY: supportSlide }] }}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
            <LogOut size={22} color={Colors.error} />
            <Typography variant="body" weight="bold" color={Colors.error} style={{ marginLeft: 10 }}>
              Logout securely
            </Typography>
          </TouchableOpacity>

          <Typography variant="caption" color={Colors.textSecondary} align="center" style={styles.versionText}>
            Xpertance Parent App • v1.0.0
          </Typography>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Lighter gray for more premium contrast with white cards
  },
  headerContainer: {
    height: Platform.OS === 'ios' ? 240 : 220,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: InnonshColors.primary,
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
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(131, 41, 150, 0.95)', // InnonshColors.primary with opacity
  },
  backButton: {
    marginRight: 10,
    marginLeft: -6,
    padding: 4,
  },
  navTitle: {
    fontSize: 24,
    letterSpacing: -0.5,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 120 : 100, // push content below header
    paddingBottom: 100,
  },
  profileCard: {
    marginTop: 20, // Deliberate overlap effect
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: InnonshColors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.05)',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 20,
    padding: 4,
    backgroundColor: Colors.white,
    borderRadius: 50,
    shadowColor: InnonshColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatar: {
    // any extra styles native to your Avatar component
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#10B981', // Emerald
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  emailText: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: Colors.textPrimary,
    marginLeft: 8,
    letterSpacing: -0.2,
  },
  cardGroup: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: InnonshColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightElementContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 84, // align with text
    marginRight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: '#FEF2F2', // Red-50
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FECACA', // Red-200
    marginBottom: 32,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  versionText: {
    opacity: 0.6,
    marginBottom: 40,
  }
});

