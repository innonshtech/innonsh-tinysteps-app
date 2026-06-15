import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Activity, Clock, Droplet, User, Phone, ChevronLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../../components/ui/Typography';
import { Avatar } from '../../components/ui/Avatar';
import { CustomTabs, TabItem } from '../../components/ui/CustomTabs';
import { Colors } from '../../constants/colors';
import { useChildStore, Child } from '../../store/childStore';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

type Props = NativeStackScreenProps<RootStackParamList, 'ChildDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ChildDetailScreen({ route }: Props) {
  const { childId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const children = useChildStore((state) => state.children);
  const { isModuleEnabled } = useFeatureFlags();

  const activeTabs: TabItem[] = [
    { key: 'overview', title: 'Overview' },
  ];
  
  if (isModuleEnabled('attendance')) {
    activeTabs.push({ key: 'attendance', title: 'Attendance' });
  }
  
  if (isModuleEnabled('fees')) {
    activeTabs.push({ key: 'fees', title: 'Fees' });
  }

  const [activeTab, setActiveTab] = useState('overview');
  const [child, setChild] = useState<Child | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideYAnim = useRef(new Animated.Value(40)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const foundChild = children.find(c => c._id === childId);
    if (foundChild) setChild(foundChild);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideYAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, [childId, children]);

  useEffect(() => {
    if (activeTab === 'overview') {
      contentFade.setValue(0);
      contentSlide.setValue(20);
      Animated.parallel([
        Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(contentSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
      ]).start();
    }
  }, [activeTab]);

  // Handle Tab Navigation logic
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    switch (key) {
      case 'attendance':
        navigation.navigate('Attendance', { childId });
        setActiveTab('overview');
        break;
      case 'fees':
        navigation.navigate('MainTabs', { screen: 'Fees' });
        break;
      case 'timetable':
        if (child) {
          navigation.navigate('Timetable', { classId: child.classId });
        }
        setActiveTab('overview');
        break;
      default:
        break;
    }
  };

  if (!child) return null;

  return (
    <View style={styles.container}>
      {/* Premium Gradient Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <LinearGradient
          colors={[Colors.primary, '#4338CA']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.headerShape1} />
        <View style={styles.headerShape2} />

        {/* Custom Nav Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ChevronLeft color={Colors.white} size={28} />
          </TouchableOpacity>
          <Typography variant="h3" weight="bold" color={Colors.white} style={styles.navTitle}>
            Child Details
          </Typography>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View style={[styles.profileContent, { opacity: fadeAnim, transform: [{ translateY: slideYAnim }] }]}>
          <View style={styles.avatarWrapper}>
            <Avatar name={child.name} size={90} style={styles.avatar} />
          </View>
          <Typography variant="h2" weight="bold" color={Colors.white} align="center" style={styles.childName}>
            {child.name}
          </Typography>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Typography variant="caption" weight="medium" color={Colors.primary}>
                Class: {child.className}
              </Typography>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Typography variant="caption" weight="medium" color={Colors.white}>
                Adm: {child.admissionNo}
              </Typography>
            </View>
          </View>
        </Animated.View>
      </View>

      <CustomTabs tabs={activeTabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Overview Content */}
      {activeTab === 'overview' && (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>

            <Typography variant="h4" weight="bold" style={styles.sectionTitle}>
              Personal Information
            </Typography>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                  <User size={20} color={Colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Typography variant="caption" color={Colors.textSecondary}>Gender</Typography>
                  <Typography variant="body" weight="bold" color={Colors.textPrimary}>
                    {child.gender || 'Male'}
                  </Typography>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: 'rgba(79, 70, 229, 0.1)' }]}>
                  <Clock size={20} color={Colors.primary} />
                </View>
                <View style={styles.infoText}>
                  <Typography variant="caption" color={Colors.textSecondary}>Date of Birth</Typography>
                  <Typography variant="body" weight="bold" color={Colors.textPrimary}>
                    {child.dob || '14 Oct 2018'}
                  </Typography>
                </View>
              </View>
            </View>

            <Typography variant="h4" weight="bold" style={[styles.sectionTitle, { marginTop: 8 }]}>
              Medical & Emergency
            </Typography>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Activity size={20} color={Colors.error} />
                </View>
                <View style={styles.infoText}>
                  <Typography variant="caption" color={Colors.textSecondary}>Allergies/Medical</Typography>
                  <Typography variant="body" weight="bold" color={Colors.error}>
                    {child.medicalInfo || 'Peanuts'}
                  </Typography>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Droplet size={20} color="#10b981" />
                </View>
                <View style={styles.infoText}>
                  <Typography variant="caption" color={Colors.textSecondary}>Blood Group</Typography>
                  <Typography variant="body" weight="bold" color={Colors.textPrimary}>
                    O+
                  </Typography>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Phone size={20} color={Colors.warning} />
                </View>
                <View style={styles.infoText}>
                  <Typography variant="caption" color={Colors.textSecondary}>Pickup Person</Typography>
                  <Typography variant="body" weight="bold" color={Colors.textPrimary}>
                    {child.pickupPerson || 'Mother (Default)'}
                  </Typography>
                </View>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    position: 'relative',
    zIndex: 10,
    backgroundColor: Colors.primary,
  },
  headerShape1: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerShape2: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
  },
  profileContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarWrapper: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    marginBottom: 16,
  },
  avatar: {
    borderWidth: 3,
    borderColor: Colors.white,
  },
  childName: {
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginVertical: 16,
    marginLeft: 56, // Align with text
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
  },
});

