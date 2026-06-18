import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Calendar as CalendarIcon, AlertTriangle, ReceiptText, Download, ChevronRight, ChevronLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import Svg, { Circle } from 'react-native-svg';

import { FeesService } from '../../services/fees.service';
import { useChildStore } from '../../store/childStore';
import { RootStackParamList } from '../../navigation/AppNavigator';

const BrandColors = {
  primary: '#832996',
  secondary: '#8B3D9F',
  background: '#F7F1FA',
  surface: '#ffffff',
  textPrimary: '#212529',
  textSecondary: '#484848',
  accentOrange: '#DC7603',
  error: '#ba1a1a',
  success: '#2e7d32',
  surfaceLavender: '#F7F1FA',
  surfaceContainer: '#ebeef3',
  tertiaryFixed: '#ffdcc4',
  onTertiaryFixed: '#2f1400',
  primaryFixed: '#fed6ff',
  onPrimaryFixed: '#350041',
  errorContainer: '#ffdad6',
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FeesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const selectedChild = useChildStore(state => state.selectedChild);

  const [fees, setFees] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalDue: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideYAnim = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideYAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchFees();
    }
  }, [selectedChild]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const response = await FeesService.getStudentFees(selectedChild?._id as string);
      if (response.success) {
        const fetchedFees = response.fees || [];
        const mappedFees = fetchedFees.map((f: any) => ({
          id: f._id,
          category: f.period || f.name || 'Additional Fee',
          amount: f.amountDue || f.amount || 0,
          paid: f.amountPaid || 0,
          status: f.status || 'due',
          dueDate: f.dueDate ? dayjs(f.dueDate).format('YYYY-MM-DD') : '-',
          fine: f.fine || 0,
          paymentMode: f.paymentMethod || 'Online'
        }));
        
        setFees(mappedFees);
        
        const totalDue = response.totalDue || 0;
        const totalPaid = response.totalPaid || 0;
        setSummary({ totalDue, totalPaid });

        // Calculate progress percentage
        const total = totalDue + totalPaid;
        const percentage = total > 0 ? (totalPaid / total) : 0;
        
        Animated.timing(progressAnim, {
          toValue: percentage,
          duration: 1000,
          delay: 300,
          useNativeDriver: true,
        }).start();

      }
    } catch (e) {
      console.error('Failed to fetch fees', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const renderProgressRing = () => {
    const size = 120;
    const strokeWidth = 8;
    const center = size / 2;
    const radius = size / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const total = summary.totalDue + summary.totalPaid;
    const percent = total > 0 ? (summary.totalPaid / total) * 100 : 0;

    return (
      <View style={styles.progressSection}>
        <View style={styles.progressRingContainer}>
          <Svg width={size} height={size}>
            <Circle
              stroke={BrandColors.surfaceContainer}
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
            />
            <Circle
              stroke={BrandColors.primary}
              fill="none"
              cx={center}
              cy={center}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * percent) / 100}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressPercent}>{Math.round(percent)}%</Text>
            <Text style={styles.progressLabel}>PAID</Text>
          </View>
        </View>
        
        <View style={styles.progressDetails}>
          <Text style={styles.progressSubtitle}>Total Additional Fees</Text>
          <Text style={styles.progressTotal}>{formatCurrency(total)}</Text>
          
          <View style={styles.progressLegend}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: BrandColors.primary }]} />
              <Text style={styles.legendText}>Paid: {formatCurrency(summary.totalPaid)}</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: BrandColors.error }]} />
              <Text style={styles.legendText}>Pending: {formatCurrency(summary.totalDue)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const upcomingFee = fees.find(f => f.status === 'due' || f.status === 'partial');

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <Animated.View style={[styles.headerContainer, { paddingTop: insets.top + 16, opacity: fadeAnim }]}>
        <LinearGradient
          colors={[BrandColors.primary, BrandColors.secondary]}
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
            <Text style={styles.headerScreenTitle}>Fees Overview</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>Academic Year 2023-24</Text>
      </Animated.View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideYAnim }] }}>
          
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, styles.cardShadow]}>
              <Text style={styles.summaryCardLabel}>PENDING CHARGES</Text>
              <Text style={[styles.summaryCardValue, { color: BrandColors.error }]}>{formatCurrency(summary.totalDue)}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { backgroundColor: BrandColors.error, width: '25%' }]} />
              </View>
            </View>

            <View style={[styles.summaryCard, styles.cardShadow]}>
              <Text style={styles.summaryCardLabel}>PAID CHARGES</Text>
              <Text style={[styles.summaryCardValue, { color: BrandColors.primary }]}>{formatCurrency(summary.totalPaid)}</Text>
              <View style={[styles.progressBarBg, { backgroundColor: BrandColors.primaryFixed }]}>
                <View style={[styles.progressBarFill, { backgroundColor: BrandColors.primary, width: '75%' }]} />
              </View>
            </View>
          </View>

          {/* Progress Visualization */}
          {renderProgressRing()}

          {/* Upcoming Pending Charges */}
          {upcomingFee && (
            <View style={[styles.upcomingCard, styles.cardShadow]}>
              <View style={styles.upcomingHeader}>
                <View style={styles.dueBadge}>
                  <AlertTriangle size={14} color={BrandColors.onTertiaryFixed} style={{ marginRight: 4 }} />
                  <Text style={styles.dueBadgeText}>Due Soon</Text>
                </View>
                <Text style={styles.upcomingCategory}>{upcomingFee.category}</Text>
              </View>
              <View style={styles.upcomingAmountContainer}>
                <Text style={styles.upcomingAmountLabel}>Amount</Text>
                <Text style={styles.upcomingAmount}>{formatCurrency(upcomingFee.amount)}</Text>
              </View>
              
              <View style={styles.upcomingFooter}>
                <View style={styles.dueDateRow}>
                  <CalendarIcon size={16} color={BrandColors.textSecondary} />
                  <Text style={styles.dueDateText}>Due: {upcomingFee.dueDate}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.payNowBtn}
                  onPress={() => navigation.navigate('PayFee', { transactionId: upcomingFee.id })}
                >
                  <Text style={styles.payNowText}>Pay Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Fee Categories */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fee Categories</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 20 }} />
          ) : fees.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No Additional Charges Available</Text>
            </View>
          ) : (
            <View style={styles.categoriesList}>
              {fees.map((fee, idx) => {
                const isPaid = fee.status === 'paid';
                return (
                  <TouchableOpacity 
                    key={idx} 
                    style={[styles.categoryCard, styles.cardShadow]}
                    onPress={() => navigation.navigate('FeeDetail', { transactionId: fee.id })}
                  >
                    <View style={styles.catCardLeft}>
                      <View style={styles.catIconBox}>
                        <ReceiptText size={24} color={BrandColors.primary} />
                      </View>
                      <View>
                        <Text style={styles.catName}>{fee.category}</Text>
                        <Text style={styles.catAmount}>{formatCurrency(fee.amount)}</Text>
                      </View>
                    </View>
                    <View style={styles.catCardRight}>
                      <View style={[
                        styles.statusBadge, 
                        isPaid ? { backgroundColor: BrandColors.success } : { backgroundColor: BrandColors.accentOrange }
                      ]}>
                        <Text style={styles.statusBadgeText}>{isPaid ? 'PAID' : 'PENDING'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Recent Transactions */}
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {fees.filter(f => f.status === 'paid').map((tx, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.txItem}
                onPress={() => navigation.navigate('FeeDetail', { transactionId: tx.id })}
              >
                <View style={styles.txLeft}>
                  <View style={styles.txIconBox}>
                    <ReceiptText size={20} color={BrandColors.primary} />
                  </View>
                  <View>
                    <Text style={styles.txName}>Receipt: TS-{tx.id.substring(0, 4).toUpperCase()}</Text>
                    <Text style={styles.txDesc}>{tx.dueDate} • {tx.paymentMode}</Text>
                  </View>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txAmount}>{formatCurrency(tx.amount)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: BrandColors.success, marginTop: 4, alignSelf: 'flex-end' }]}>
                    <Text style={styles.statusBadgeText}>PAID</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {fees.filter(f => f.status === 'paid').length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No recent transactions</Text>
              </View>
            )}
          </View>

          {/* Download Receipt CTA */}
          {fees.filter(f => f.status === 'paid').length > 0 && (
            <TouchableOpacity 
              style={styles.downloadBtn}
              onPress={() => {
                const latestPaid = fees.filter(f => f.status === 'paid')[0];
                if (latestPaid) {
                  navigation.navigate('FeeDetail', { transactionId: latestPaid.id });
                }
              }}
            >
              <Download size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.downloadBtnText}>Download Last Receipt</Text>
            </TouchableOpacity>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 3,
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
    backgroundColor: BrandColors.primary,
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
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,

    marginBottom: 32,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  summaryCardLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: BrandColors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  summaryCardValue: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 24,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: BrandColors.errorContainer,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressSection: {
    flexDirection: 'row',
    backgroundColor: BrandColors.surfaceLavender,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  progressRingContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 24,
    color: BrandColors.primary,
  },
  progressLabel: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 10,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  progressDetails: {
    flex: 1,
    marginLeft: 24,
  },
  progressSubtitle: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  progressTotal: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 24,
    color: BrandColors.textPrimary,
    marginTop: 4,
    marginBottom: 12,
  },
  progressLegend: {
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  upcomingCard: {
    backgroundColor: BrandColors.surface,
    padding: 24,
    borderRadius: 24,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.accentOrange,
    marginBottom: 32,
  },
  upcomingHeader: {
    marginBottom: 16,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.tertiaryFixed,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  dueBadgeText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: BrandColors.onTertiaryFixed,
  },
  upcomingCategory: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: BrandColors.textPrimary,
  },
  upcomingAmountContainer: {
    position: 'absolute',
    right: 24,
    top: 24,
    alignItems: 'flex-end',
  },
  upcomingAmountLabel: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  upcomingAmount: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: BrandColors.accentOrange,
  },
  upcomingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.surfaceContainer,
  },
  dueDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: BrandColors.textPrimary,
    marginLeft: 8,
  },
  payNowBtn: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  payNowText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 14,
    color: '#FFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 20,
    color: BrandColors.textPrimary,
  },
  viewAllText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: BrandColors.primary,
  },
  categoriesList: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.surface,
    padding: 16,
    borderRadius: 16,
  },
  catCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(104, 4, 125, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  catName: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
    color: BrandColors.textPrimary,
    marginBottom: 4,
  },
  catAmount: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: BrandColors.textSecondary,
  },
  catCardRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 10,
    color: '#FFF',
  },
  transactionsList: {
    gap: 12,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BrandColors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.surfaceContainer,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(104, 4, 125, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  txName: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 14,
    color: BrandColors.textPrimary,
    marginBottom: 4,
  },
  txDesc: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 16,
    color: BrandColors.textPrimary,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 14,
    color: BrandColors.textSecondary,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.primary,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  downloadBtnText: {
    fontFamily: 'GoogleSans-Medium',
    fontSize: 16,
    color: '#FFF',
  }
});

