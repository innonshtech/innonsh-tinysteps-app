import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { InnonshColors } from '../../theme/colors';

export default function PayFeeScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Pay Fee" showBack />
      <View style={styles.content}>
        <Typography variant="h2" color={InnonshColors.textSecondary}>
          Payment Gateway Integration Pending
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: InnonshColors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});

