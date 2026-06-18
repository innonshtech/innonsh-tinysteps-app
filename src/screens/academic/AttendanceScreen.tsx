import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-calendars';
import Svg, { Circle } from 'react-native-svg';
import { ChevronLeft, Bell, Calendar as CalendarIcon, Sparkles, CheckCircle2, XCircle, CalendarOff, Briefcase } from 'lucide-react-native';
import dayjs from 'dayjs';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InnonshColors } from '../../theme/colors';
import { AttendanceService } from '../../services/attendance.service';
import { useChildStore } from '../../store/childStore';

type NavigationProp = NativeStackNavigationProp<any>;

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
  emerald500: '#10b981',
  red500: '#ef4444',
  amber400: '#fbbf24',
};

// Circular Progress Component
const CircularProgress = ({ percent, fraction }: { percent: number, fraction: string }) => {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={styles.circularProgressContainer}>
      <Svg width={size} height={size}>
        <Circle
          stroke={brandColors.surfaceContainerHighest}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={brandColors.primary}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.circularProgressTextContainer}>
        <Text style={styles.circularProgressFraction}>{fraction}</Text>
        <Text style={styles.circularProgressLabel}>Days</Text>
      </View>
    </View>
  );
};

export default function AttendanceScreen() {
  const selectedChild = useChildStore(state => state.selectedChild);
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const [markedDates, setMarkedDates] = useState<any>({});
  
  const [counts, setCounts] = useState({ present: 0, absent: 0, leave: 0, holidays: 0 });
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [totalWorkingDays, setTotalWorkingDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);

  // Animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 700, delay: 150, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, tension: 50, friction: 8, delay: 150, useNativeDriver: true })
    ]).start();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchAttendance();
    }
  }, [selectedChild, selectedMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await AttendanceService.getStudentAttendance(selectedChild?._id as string);
      const attendance = response.attendance || [];

      // Process month-specific data using local time
      const monthRecords = attendance.filter((r: any) => r.date && dayjs(r.date).format('YYYY-MM') === selectedMonth);
      
      const newMarkedDates: any = {};
      let cPresent = 0, cAbsent = 0, cLeave = 0, cHolidays = 0;

      monthRecords.forEach((record: any) => {
        const dateStr = dayjs(record.date).format('YYYY-MM-DD');
        let color = brandColors.emerald500;
        let bgColor = '#ecfdf5'; // emerald-50
        
        const lowerStatus = record.status?.toLowerCase() || '';
        
        if (lowerStatus === 'absent') { 
          color = brandColors.red500; bgColor = '#fef2f2'; cAbsent++; 
        } else if (lowerStatus === 'leave' || lowerStatus === 'excused') { 
          color = brandColors.amber400; bgColor = '#fffbeb'; cLeave++; 
        } else if (lowerStatus === 'holiday') {
          color = brandColors.textSecondary; bgColor = brandColors.surfaceContainer; cHolidays++;
        } else { 
          cPresent++; 
        }

        newMarkedDates[dateStr] = {
          selected: true,
          selectedColor: bgColor,
          customStyles: {
            container: {
              backgroundColor: bgColor,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: color + '40',
            },
            text: {
              color: color,
              fontFamily: 'GoogleSans-Bold'
            }
          }
        };
      });
      
      setMarkedDates(newMarkedDates);
      setCounts({ present: cPresent, absent: cAbsent, leave: cLeave, holidays: cHolidays });
      
      const workingDays = cPresent + cAbsent + cLeave;
      setTotalWorkingDays(workingDays);
      setAttendancePercentage(workingDays > 0 ? Math.round((cPresent / workingDays) * 100) : 0);

      // Process Streak (from all records, not just month)
      const sortedRecords = [...attendance].sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
      let currentStreak = 0;
      for (const record of sortedRecords) {
        const status = record.status?.toLowerCase() || '';
        if (status === 'present') {
          currentStreak++;
        } else if (status === 'absent' || status === 'leave') {
          break; // Streak broken
        }
        // ignore holidays for streak continuity
      }
      setStreak(currentStreak);

      // Process Recent History (Top 5)
      setRecentHistory(sortedRecords.slice(0, 5));

    } catch (e) {
      console.error('Failed to fetch attendance', e);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (dateStr: string) => {
    return dayjs(dateStr).format('MMMM YYYY');
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('present')) return { bg: '#ecfdf5', text: '#10b981', border: '#a7f3d0' };
    if (s.includes('absent')) return { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' };
    if (s.includes('leave')) return { bg: '#fffbeb', text: '#f59e0b', border: '#fde68a' };
    return { bg: brandColors.surfaceContainer, text: brandColors.textSecondary, border: brandColors.surfaceContainerHighest };
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Animated.View style={[styles.headerContainer, { paddingTop: insets.top + 16, opacity: headerFade }]}>
        <LinearGradient
          colors={[brandColors.primary, brandColors.secondary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={styles.headerUpperInner}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft color="#fff" size={28} />
            </TouchableOpacity>
            <Text style={styles.headerScreenTitle}>Attendance</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>Analytics</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
          
          {loading ? (
            <ActivityIndicator size="large" color={brandColors.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Student Inline Summary */}
              <View style={styles.studentSummaryRow}>
                <View>
                  <Text style={styles.studentName}>{selectedChild?.name}</Text>
                  <Text style={styles.studentMeta}>Class {selectedChild?.className} • Roll No. {selectedChild?.admissionNo}</Text>
                </View>
              </View>

              {/* Attendance Summary Bento Grid */}
              <View style={styles.bentoGrid}>
                {/* Rate Card */}
                <View style={styles.rateCard}>
                  <View style={styles.rateCardLeft}>
                    <Text style={styles.rateCardLabel}>Monthly Attendance Rate</Text>
                    <Text style={styles.rateCardValue}>{attendancePercentage}%</Text>
                    
                    <View style={styles.rateCardCounts}>
                      <View style={styles.countPill}>
                        <View style={[styles.countDot, { backgroundColor: brandColors.emerald500 }]} />
                        <Text style={styles.countText}>Present: {counts.present}</Text>
                      </View>
                      <View style={styles.countPill}>
                        <View style={[styles.countDot, { backgroundColor: brandColors.red500 }]} />
                        <Text style={styles.countText}>Absent: {counts.absent}</Text>
                      </View>
                      <View style={styles.countPill}>
                        <View style={[styles.countDot, { backgroundColor: brandColors.amber400 }]} />
                        <Text style={styles.countText}>Leave: {counts.leave}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.rateCardRight}>
                    <CircularProgress percent={attendancePercentage} fraction={`${counts.present}/${totalWorkingDays}`} />
                  </View>
                </View>

                {/* Streak Card */}
                <View style={styles.streakCard}>
                  <View style={{ zIndex: 10 }}>
                    <Text style={styles.streakLabel}>Streak</Text>
                    <Text style={styles.streakValue}>{streak} Days</Text>
                    <Text style={styles.streakSub}>Consistency is key!</Text>
                  </View>
                  <Sparkles color="#ffffff" size={80} style={styles.streakBgIcon} />
                </View>
              </View>

              {/* Calendar Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Daily Log</Text>
                </View>
                <Calendar
                  current={selectedMonth}
                  onMonthChange={(month: any) => setSelectedMonth(month.dateString.substring(0, 7))}
                  markedDates={markedDates}
                  markingType={'custom'}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: brandColors.textSecondary,
                    selectedDayBackgroundColor: brandColors.primary,
                    selectedDayTextColor: '#fff',
                    todayTextColor: brandColors.primary,
                    dayTextColor: brandColors.textPrimary,
                    textDisabledColor: 'rgba(0,0,0,0.1)',
                    arrowColor: brandColors.primary,
                    monthTextColor: brandColors.textPrimary,
                    indicatorColor: brandColors.primary,
                    textDayFontFamily: 'GoogleSans-Medium',
                    textMonthFontFamily: 'GoogleSans-Bold',
                    textDayHeaderFontFamily: 'GoogleSans-SemiBold',
                    textDayFontSize: 16,
                    textMonthFontSize: 20,
                    textDayHeaderFontSize: 14,
                  } as any}
                />
              </View>

              {/* Status Cards (Replacing Trend Graph) */}
              <View style={styles.statusGrid}>
                <View style={[styles.statusCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                  <CheckCircle2 color={brandColors.emerald500} size={24} style={styles.statusIcon} />
                  <Text style={[styles.statusLabel, { color: '#065f46' }]}>Present</Text>
                  <Text style={[styles.statusValue, { color: '#047857' }]}>{counts.present} Days</Text>
                </View>
                <View style={[styles.statusCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                  <XCircle color={brandColors.red500} size={24} style={styles.statusIcon} />
                  <Text style={[styles.statusLabel, { color: '#991b1b' }]}>Absent</Text>
                  <Text style={[styles.statusValue, { color: '#b91c1c' }]}>{counts.absent} Days</Text>
                </View>
                <View style={[styles.statusCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
                  <CalendarOff color={brandColors.amber400} size={24} style={styles.statusIcon} />
                  <Text style={[styles.statusLabel, { color: '#92400e' }]}>Leave</Text>
                  <Text style={[styles.statusValue, { color: '#b45309' }]}>{counts.leave} Days</Text>
                </View>
                <View style={[styles.statusCard, { backgroundColor: brandColors.surfaceContainer, borderColor: brandColors.surfaceContainerHighest }]}>
                  <Briefcase color={brandColors.textSecondary} size={24} style={styles.statusIcon} />
                  <Text style={styles.statusLabel}>Holidays</Text>
                  <Text style={styles.statusValue}>{counts.holidays} Days</Text>
                </View>
              </View>

              {/* Recent History */}
              <View style={[styles.card, { paddingHorizontal: 0, paddingBottom: 0 }]}>
                <View style={[styles.cardHeader, { paddingHorizontal: 24, marginBottom: 12 }]}>
                  <Text style={styles.cardTitle}>Recent History</Text>
                </View>
                
                {recentHistory.length > 0 ? (
                  recentHistory.map((item, index) => {
                    const d = dayjs(item.date);
                    const day = d.format('DD');
                    const dayName = d.format('dddd');
                    const monthName = d.format('MMM');
                    const sColor = getStatusColor(item.status);
                    
                    return (
                      <View key={index} style={styles.historyRow}>
                        <View style={styles.historyLeft}>
                          <View style={[styles.historyDateBox, { backgroundColor: sColor.bg }]}>
                            <Text style={[styles.historyDateNum, { color: sColor.text }]}>{day}</Text>
                          </View>
                          <View>
                            <Text style={styles.historyDateFull}>{dayName}, {monthName} {day}</Text>
                            <Text style={styles.historyRemark}>{item.remark || 'Attendance Logged'}</Text>
                          </View>
                        </View>
                        <View style={[styles.historyBadge, { backgroundColor: sColor.bg, borderColor: sColor.border }]}>
                          <Text style={[styles.historyBadgeText, { color: sColor.text }]}>{item.status}</Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No attendance records available.</Text>
                  </View>
                )}
              </View>
            </>
          )}

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
  headerContainer: {
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: brandColors.primary,
  },
  headerUpperInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    marginLeft: -6,
    padding: 4,
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: '#fed6ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerScreenTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 24,
    lineHeight: 32,
    color: '#fff',
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Bottom Nav spacing
  },
  studentSummaryRow: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  studentName: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: brandColors.textPrimary,
  },
  studentMeta: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 14,
    color: brandColors.textSecondary,
    marginTop: 2,
  },
  bentoGrid: {
    marginBottom: 24,
  },
  rateCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  rateCardLeft: {
    flex: 1,
  },
  rateCardLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: brandColors.textSecondary,
    marginBottom: 4,
  },
  rateCardValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 40,
    color: brandColors.primary,
    marginBottom: 12,
  },
  rateCardCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  countText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: brandColors.textPrimary,
  },
  rateCardRight: {
    width: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressFraction: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: brandColors.primary,
  },
  circularProgressLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: brandColors.textSecondary,
  },
  streakCard: {
    backgroundColor: brandColors.primary,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  streakLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  streakValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 28,
    color: '#fff',
    marginTop: 4,
  },
  streakSub: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  streakBgIcon: {
    position: 'absolute',
    right: -16,
    bottom: -16,
    opacity: 0.1,
    transform: [{ rotate: '15deg' }],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: brandColors.textPrimary,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statusCard: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusIcon: {
    marginBottom: 12,
  },
  statusLabel: {
    fontFamily: 'GoogleSans-SemiBold',
    fontSize: 14,
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.surfaceContainer,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDateBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyDateNum: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
  },
  historyDateFull: {
    fontFamily: 'GoogleSans-SemiBold',
    fontSize: 15,
    color: brandColors.textPrimary,
  },
  historyRemark: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 13,
    color: brandColors.textSecondary,
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyBadgeText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: brandColors.textSecondary,
  }
});

