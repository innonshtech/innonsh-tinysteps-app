import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react-native';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { StatusBadge, BadgeStatus } from '../../components/ui/StatusBadge';
import { PodarColors } from '../../theme/colors';
import { PodarSpacing, PodarRadius } from '../../theme/spacing';
import { PodarShadows } from '../../theme/shadows';
import { EventsService } from '../../services/events.service';
import { useChildStore } from '../../store/childStore';

export default function EventsScreen({ route }: any) {
  const selectedChild = useChildStore(state => state.selectedChild);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (selectedChild) {
      fetchEvents();
    }
  }, [selectedChild]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await EventsService.getPublishedEvents();
      if (response && response.events) {
        const allEvents = response.events;

        const childEvents = allEvents.filter((e: any) => {
          if (!e.classIds || e.classIds.length === 0) return true;
          return e.classIds.includes(selectedChild?.classId);
        });

        const mapped = childEvents.map((e: any, index: number) => {
          let dateStr = e.date || '';
          if (dateStr.includes('T')) {
            const d = new Date(dateStr);
            dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
          }

          let typeColor: BadgeStatus = 'info';
          if (e.type === 'Holiday') typeColor = 'error';
          if (e.type === 'Academic') typeColor = 'success';
          if (e.type === 'General') typeColor = 'warning';

          return {
            id: e._id || index.toString(),
            title: e.title || 'Event',
            date: dateStr,
            time: e.time || 'All Day',
            venue: e.venue || '-',
            type: e.type || 'General',
            typeColor
          };
        });

        setEvents(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch events', e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: typeof events[0] }) => (
    <View style={styles.card}>
      <View style={styles.dateBlock}>
        <Typography variant="h3" color={PodarColors.primary}>{item.date.split(' ')[0]}</Typography>
        <Typography variant="caption" color={PodarColors.textSecondary}>
          {item.date.split(' ').slice(1).join(' ')}
        </Typography>
      </View>
      <View style={styles.contentBlock}>
        <View style={styles.titleRow}>
          <Typography variant="h4" color={PodarColors.textPrimary} style={{ flex: 1, marginRight: 8 }}>
            {item.title}
          </Typography>
          <StatusBadge label={item.type} status={item.typeColor} style={styles.badge} />
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={PodarColors.textSecondary} style={styles.icon} />
          <Typography variant="caption" color={PodarColors.textSecondary}>{item.time}</Typography>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color={PodarColors.textSecondary} style={styles.icon} />
          <Typography variant="caption" color={PodarColors.textSecondary}>{item.venue}</Typography>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Events Calendar" showBack />

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PodarColors.background,
  },
  listContent: {
    padding: PodarSpacing.lg,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: PodarColors.surface,
    borderRadius: PodarRadius.lg,
    marginBottom: PodarSpacing.lg,
    ...PodarShadows.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: PodarColors.border,
  },
  dateBlock: {
    width: 80,
    backgroundColor: PodarColors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: PodarSpacing.md,
  },
  contentBlock: {
    flex: 1,
    padding: PodarSpacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 8,
  }
});

