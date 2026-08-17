import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CalendarCheck, CreditCard, Calendar, Image as ImageIcon, Bell, FileText, Megaphone } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { useAuthStore } from '../../store/authStore';
import { useChildStore } from '../../store/childStore';
import { useNotificationStore } from '../../store/notificationStore';
import { BottomTabParamList } from '../../navigation/BottomTabNavigator';
import { DashboardService } from '../../services/dashboard.service';
import { getFirstName } from '../../utils/formatName';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<any>
>;

// Define explicit Innonsh branding colors from HTML reference
const brandColors = {
  primary: '#68047d',
  secondary: '#8b3d9f',
  surfaceLavender: '#F7F1FA',
  textPrimary: '#181c20',
  textSecondary: '#484848',
  accentOrange: '#DC7603',
  error: '#ba1a1a',
  blue600: '#2563eb',
  green600: '#16a34a',
  surfaceContainer: '#ebeef3',
  surfaceContainerHighest: '#e0e3e8',
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  const { children, selectedChild, fetchChildren, setSelectedChild } = useChildStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic dashboard states
  const [attendancePercent, setAttendancePercent] = useState('0%');
  const [attendanceStatus, setAttendanceStatus] = useState('Attendance Not Available');
  const [feesDueAmt, setFeesDueAmt] = useState('₹0');
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchDashboardData = useCallback(async () => {
    if (!selectedChild?._id) return;
    try {
      const dashboardRes = await DashboardService.getDashboardData(selectedChild._id);
      
      if (!dashboardRes.success) {
        return;
      }
      
      const dashboardData = dashboardRes.data || {};

      const attendance = dashboardData.attendance || [];
      let presentCount = 0;
      attendance.forEach((r: any) => {
        if (r.status?.toLowerCase() !== 'absent') presentCount++;
      });
      const percent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
      setAttendancePercent(`${percent}%`);

      // Determine today's status
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = attendance.find((a: any) => a.date && a.date.startsWith(todayStr));
      let currentStatus = 'Attendance Not Available';
      if (todayRecord && todayRecord.status) {
        currentStatus = todayRecord.status;
      } else if (attendance.length > 0) {
        // Fallback to most recent if today is not found
        currentStatus = attendance[attendance.length - 1].status || 'Attendance Not Available';
      }
      setAttendanceStatus(currentStatus);

      // Pending fees
      const fetchedFees = dashboardData.fees || [];
      let pendingAmt = 0;
      fetchedFees.forEach((f: any) => {
        if (f.status === 'due' || f.status === 'partial' || f.status === 'Unpaid' || f.status === 'Partial') {
          pendingAmt += Number(f.amount || 0);
        }
      });
      setFeesDueAmt(pendingAmt > 0 ? `₹${pendingAmt.toLocaleString()}` : 'No Dues');

      const notifications = dashboardData.notifications || [];
      setRecentNotifications(Array.isArray(notifications) ? notifications.slice(0, 3) : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [selectedChild]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChildren();
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchChildren, fetchDashboardData]);

  useEffect(() => {
    fetchChildren();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchDashboardData();
    }
  }, [selectedChild, fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('present')) return { bg: '#dcfce7', text: '#15803d' };
    if (s.includes('absent')) return { bg: '#fee2e2', text: '#b91c1c' };
    if (s.includes('leave')) return { bg: '#fef3c7', text: '#b45309' };
    return { bg: '#f3f4f6', text: '#4b5563' }; // Default gray
  };

  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
  const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);
  
  const statusColors = getStatusColor(attendanceStatus);
  const greetingName = getFirstName(selectedChild?.name || user?.name, 'Parent');

  const renderChildPill = ({ item }: { item: any }) => {
    const isSelected = selectedChild?._id === item._id;
    return (
      <TouchableOpacity
        style={[styles.childPill, isSelected && styles.childPillSelected]}
        onPress={() => setSelectedChild(item)}
        activeOpacity={0.8}
      >
        <Text style={[styles.childPillText, isSelected && styles.childPillTextSelected]}>
          {getFirstName(item.name, 'Child')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brandColors.primary]} />}
      >
        {/* Header Section */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + 24 }]}>
          <LinearGradient
            colors={[brandColors.primary, brandColors.secondary]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>TinySteps</Text>
              <Text style={styles.headerSubtitle}>Innonsh International School</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
              <Bell color="#fff" size={24} />
              {unreadCount > 0 && <View style={styles.bellBadge} />}
            </TouchableOpacity>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()} {greetingName}</Text>
            <Text style={styles.dateText}>Today is {formattedDate}</Text>
          </View>
          
          {children.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childSelectorContainer}>
              {children.map(child => (
                <React.Fragment key={child._id}>
                  {renderChildPill({ item: child })}
                </React.Fragment>
              ))}
            </ScrollView>
          )}
        </View>

        <Animated.View style={{ opacity: fadeAnim, marginTop: -40, paddingHorizontal: 24 }}>
          {/* Student Summary Card */}
          <View style={styles.studentCard}>
            <View style={styles.studentTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{selectedChild?.name || 'Student Name'}</Text>
                <Text style={styles.studentDetails}>Class {selectedChild?.className || '--'} • Roll No. {selectedChild?.admissionNo || '--'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>{attendanceStatus}</Text>
              </View>
            </View>
            
            <View style={styles.studentDivider} />
            
            <View style={styles.studentBottomRow}>
              <View style={styles.studentStatBox}>
                <Text style={styles.studentStatLabel}>ATTENDANCE</Text>
                <Text style={[styles.studentStatValue, { color: brandColors.primary }]}>{attendancePercent}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.studentStatBox}>
                <Text style={styles.studentStatLabel}>STUDENT ID</Text>
                <Text style={[styles.studentStatValue, { color: brandColors.secondary }]}>{selectedChild?.admissionNo || '--'}</Text>
              </View>
            </View>
          </View>

          {/* Overview Section */}
          <View style={styles.overviewContainer}>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: `${brandColors.primary}1A` }]}>
                 <CalendarCheck color={brandColors.primary} size={24} />
              </View>
              <View>
                <Text style={styles.overviewLabel}>Attendance</Text>
                <Text style={styles.overviewValue}>{attendancePercent}</Text>
              </View>
            </View>
            <View style={styles.overviewCard}>
              <View style={[styles.overviewIconContainer, { backgroundColor: `${brandColors.accentOrange}1A` }]}>
                 <CreditCard color={brandColors.accentOrange} size={24} />
              </View>
              <View>
                <Text style={styles.overviewLabel}>Due Fees</Text>
                <Text style={styles.overviewValue}>{feesDueAmt}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => selectedChild && navigation.navigate('Attendance', { childId: selectedChild._id })}>
              <View style={[styles.actionIconBox, { backgroundColor: `${brandColors.primary}1A` }]}>
                <CalendarCheck color={brandColors.primary} size={24} />
              </View>
              <Text style={styles.actionText}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Fees')}>
              <View style={[styles.actionIconBox, { backgroundColor: `${brandColors.secondary}1A` }]}>
                <CreditCard color={brandColors.secondary} size={24} />
              </View>
              <Text style={styles.actionText}>Fees</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Events')}>
              <View style={[styles.actionIconBox, { backgroundColor: `${brandColors.error}1A` }]}>
                <Calendar color={brandColors.error} size={24} />
              </View>
              <Text style={styles.actionText}>Events</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Notifications')}>
              <View style={[styles.actionIconBox, { backgroundColor: `${brandColors.accentOrange}1A` }]}>
                <Bell color={brandColors.accentOrange} size={24} />
              </View>
              <Text style={styles.actionText}>Notifications</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Updates Timeline */}
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>Recent Updates</Text>
          </View>
          
          <View style={styles.timelineContainer}>
            {recentNotifications.length > 0 ? recentNotifications.map((notif, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: index % 2 === 0 ? brandColors.primary : brandColors.secondary }]} />
                <TouchableOpacity style={styles.timelineCard} onPress={() => navigation.navigate('Notifications')}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineTitle}>{notif.title || 'Notification'}</Text>
                    <Text style={styles.timelineTime}>{notif.createdAt ? dayjs(notif.createdAt).format('YYYY-MM-DD') : 'Recent'}</Text>
                  </View>
                  <Text style={styles.timelineDesc} numberOfLines={2}>{notif.message}</Text>
                </TouchableOpacity>
              </View>
            )) : (
              <Text style={styles.noUpdatesText}>No recent updates available.</Text>
            )}
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.surfaceLavender,
  },
  scrollContent: {
    paddingBottom: 120, // Space for BottomNavBar
  },
  headerContainer: {
    paddingBottom: 72,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    paddingHorizontal: 24,
    overflow: 'hidden',
    backgroundColor: brandColors.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 28,
    color: '#fff',
  },
  headerSubtitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brandColors.error,
    borderWidth: 2,
    borderColor: brandColors.primary,
  },
  greetingContainer: {
    marginTop: 8,
  },
  greetingText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 26,
    color: '#fff',
  },
  dateText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 16,
    color: '#fed6ff',
    marginTop: 4,
    opacity: 0.9,
  },
  childSelectorContainer: {
    marginTop: 16,
    flexDirection: 'row',
  },
  childPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  childPillSelected: {
    backgroundColor: '#fff',
  },
  childPillText: {
    fontFamily: 'GoogleSans-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  childPillTextSelected: {
    color: brandColors.primary,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  studentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentName: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 22,
    color: brandColors.textPrimary,
  },
  studentDetails: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 14,
    color: brandColors.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  studentDivider: {
    height: 1,
    backgroundColor: brandColors.surfaceContainer,
    marginVertical: 20,
  },
  studentBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  studentStatLabel: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 11,
    color: brandColors.textSecondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  studentStatValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 22,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: brandColors.surfaceContainer,
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '47%',
    height: 140,
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  overviewIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 13,
    color: brandColors.textSecondary,
    marginBottom: 4,
  },
  overviewValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: brandColors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: brandColors.textPrimary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontFamily: 'GoogleSans-SemiBold',
    fontSize: 14,
    color: brandColors.textPrimary,
  },
  timelineContainer: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: brandColors.surfaceContainerHighest,
    marginLeft: 12,
  },
  timelineItem: {
    position: 'relative',
    marginBottom: 20,
  },
  timelineDot: {
    position: 'absolute',
    left: -21,
    top: 16,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
    zIndex: 1,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginLeft: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timelineTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 15,
    color: brandColors.textPrimary,
    flex: 1,
  },
  timelineTime: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 11,
    color: brandColors.textSecondary,
    marginLeft: 8,
  },
  timelineDesc: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 14,
    color: brandColors.textSecondary,
    lineHeight: 20,
  },
  noUpdatesText: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 14,
    color: brandColors.textSecondary,
    marginLeft: 12,
  }
});

