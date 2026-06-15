import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle2, Download, Receipt } from 'lucide-react-native';
import dayjs from 'dayjs';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { StatusBadge, BadgeStatus } from '../../components/ui/StatusBadge';
import { PodarColors } from '../../theme/colors';
import { PodarSpacing, PodarRadius } from '../../theme/spacing';
import { PodarShadows } from '../../theme/shadows';
import { apiClient } from '../../api/client';
import { useChildStore } from '../../store/childStore';
import { generateReceipt } from '../../utils/receiptGenerator';

interface FeeItem {
  name: string;
  amount: number;
}

interface FeeDetails {
  id: string;
  period: string;
  studentName: string;
  class: string;
  status: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  fine: number;
  items: FeeItem[];
}

export default function FeeDetailScreen({ route, navigation }: any) {
  const { transactionId } = route.params;
  const selectedChild = useChildStore(state => state.selectedChild);

  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchFeeDetails();
  }, [transactionId]);

  const fetchFeeDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/parent/fees/${selectedChild?._id}`);
      if (response.data.success) {
        const fees = response.data.fees || [];
        const f = fees.find((item: any) => item._id === transactionId);

        if (f) {
          const components = f.components || [];
          const mappedItems = components.map((c: any) => ({
            name: c.name || (c.feeHeadId && typeof c.feeHeadId === 'object' ? c.feeHeadId.name : 'Fee Component'),
            amount: c.amount || 0
          }));

          setFeeDetails({
            id: f._id,
            period: f.period || 'Fee Period',
            studentName: selectedChild?.name || 'Student',
            class: selectedChild?.className || 'Class',
            status: f.status || 'due',
            dueDate: f.dueDate ? dayjs(f.dueDate).format('YYYY-MM-DD') : '-',
            totalAmount: f.amountDue || 0,
            amountPaid: f.amountPaid || 0,
            fine: f.fine || 0,
            items: mappedItems.length > 0 ? mappedItems : [{ name: 'Total Fee', amount: f.amountDue || 0 }]
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch fee details', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid': return { label: 'Paid', color: 'success' as BadgeStatus };
      case 'partial': return { label: 'Partial', color: 'warning' as BadgeStatus };
      case 'due': default: return { label: 'Due', color: 'error' as BadgeStatus };
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}.00`;

  const handleDownloadReceipt = async () => {
    if (!feeDetails) return;
    try {
      setDownloadLoading(true);
      await generateReceipt(feeDetails);
    } catch (error) {
      console.error('Error generating receipt:', error);
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Fee Details" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PodarColors.primary} />
          <Typography variant="body" color={PodarColors.textSecondary} style={{ marginTop: 12 }}>
            Fetching details...
          </Typography>
        </View>
      </View>
    );
  }

  if (!feeDetails) {
    return (
      <View style={styles.container}>
        <AppHeader title="Fee Details" showBack />
        <View style={styles.loadingContainer}>
          <Typography variant="body" color={PodarColors.textSecondary}>
            Fee details not found.
          </Typography>
        </View>
      </View>
    );
  }

  const { label, color } = getStatusConfig(feeDetails.status);
  const totalPayable = feeDetails.totalAmount - feeDetails.amountPaid + feeDetails.fine;
  const isDue = feeDetails.status === 'due' || feeDetails.status === 'partial';

  return (
    <View style={styles.container}>
      <AppHeader title="Fee Details" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <View style={styles.summaryCard}>
          <View style={styles.headerRow}>
            <View style={styles.iconContainer}>
              <Receipt size={24} color={PodarColors.primary} />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Typography variant="h4" color={PodarColors.textPrimary}>{feeDetails.period}</Typography>
              <Typography variant="caption" color={PodarColors.textSecondary}>{feeDetails.studentName} • {feeDetails.class}</Typography>
            </View>
            <StatusBadge label={label} status={color} />
          </View>

          <View style={styles.amountRow}>
            <View>
              <Typography variant="caption" color={PodarColors.textSecondary}>Total Amount</Typography>
              <Typography variant="h2" color={PodarColors.textPrimary}>{formatCurrency(feeDetails.totalAmount)}</Typography>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Typography variant="caption" color={PodarColors.textSecondary}>Due Date</Typography>
              <Typography variant="body" color={isDue ? PodarColors.error : PodarColors.textPrimary}>{feeDetails.dueDate}</Typography>
            </View>
          </View>
        </View>

        <Typography variant="h4" style={styles.sectionTitle}>
          Fee Breakdown
        </Typography>
        <View style={styles.detailCard}>
          {feeDetails.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Typography variant="body" color={PodarColors.textPrimary}>{item.name}</Typography>
              <Typography variant="body" color={PodarColors.textPrimary}>{formatCurrency(item.amount)}</Typography>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Typography variant="bodyLarge" color={PodarColors.textPrimary}>Subtotal</Typography>
            <Typography variant="bodyLarge" color={PodarColors.textPrimary}>{formatCurrency(feeDetails.totalAmount)}</Typography>
          </View>

          {feeDetails.fine > 0 && (
            <View style={styles.itemRow}>
              <Typography variant="bodyLarge" color={PodarColors.error}>Late Fine</Typography>
              <Typography variant="bodyLarge" color={PodarColors.error}>+ {formatCurrency(feeDetails.fine)}</Typography>
            </View>
          )}

          {feeDetails.amountPaid > 0 && (
            <View style={styles.itemRow}>
              <Typography variant="bodyLarge" color={PodarColors.success}>Amount Paid</Typography>
              <Typography variant="bodyLarge" color={PodarColors.success}>- {formatCurrency(feeDetails.amountPaid)}</Typography>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.itemRow}>
            <Typography variant="h3" color={PodarColors.primary}>Total Payable</Typography>
            <Typography variant="h3" color={PodarColors.primary}>{formatCurrency(totalPayable)}</Typography>
          </View>
        </View>

        {isDue ? (
          <Button
            title={`Pay ${formatCurrency(totalPayable)} Securely`}
            onPress={() => navigation.navigate('PayFee', { transactionId })}
            size="large"
            icon={<CheckCircle2 size={20} color={PodarColors.surface} />}
            style={styles.actionBtn}
          />
        ) : (
          <View style={styles.paidContainer}>
            <CheckCircle2 size={32} color={PodarColors.success} style={{ marginBottom: 8 }} />
            <Typography variant="h3" color={PodarColors.success}>Fully Paid</Typography>
            <Typography variant="caption" color={PodarColors.textSecondary} align="center" style={{ marginTop: 4 }}>
              Your transaction was successful. Thank you for your payment.
            </Typography>
            <Button
              title="Download Receipt"
              variant="outline"
              icon={<Download size={18} color={PodarColors.primary} />}
              onPress={handleDownloadReceipt}
              loading={downloadLoading}
              style={styles.receiptBtn}
            />
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PodarColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: PodarSpacing.lg,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: PodarColors.surface,
    borderRadius: PodarRadius.lg,
    padding: PodarSpacing.lg,
    marginBottom: PodarSpacing.lg,
    ...PodarShadows.sm,
    borderTopWidth: 4,
    borderTopColor: PodarColors.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: PodarSpacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PodarColors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: PodarSpacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: PodarColors.border,
    paddingTop: PodarSpacing.md,
  },
  sectionTitle: {
    marginBottom: PodarSpacing.md,
    color: PodarColors.textPrimary,
  },
  detailCard: {
    backgroundColor: PodarColors.surface,
    borderRadius: PodarRadius.lg,
    padding: PodarSpacing.lg,
    marginBottom: PodarSpacing.xl,
    ...PodarShadows.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: PodarColors.border,
    marginVertical: 12,
  },
  actionBtn: {
    marginBottom: PodarSpacing.lg,
  },
  paidContainer: {
    alignItems: 'center',
    backgroundColor: PodarColors.success + '10',
    padding: PodarSpacing.lg,
    borderRadius: PodarRadius.lg,
    borderWidth: 1,
    borderColor: PodarColors.success + '40',
  },
  receiptBtn: {
    marginTop: PodarSpacing.md,
    width: '100%',
  }
});

