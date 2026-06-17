import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react-native';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { StatusBadge, BadgeStatus } from '../../components/ui/StatusBadge';
import { InnonshColors } from '../../theme/colors';
import { InnonshSpacing, InnonshRadius } from '../../theme/spacing';
import { InnonshShadows } from '../../theme/shadows';
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
          // 1. Filter by target audience (show 'all', 'parents', and 'students')
          if (e.targetAudience && !['all', 'parents', 'students'].includes(e.targetAudience)) {
            return false;
          }
          // 2. Filter by class selection
          if (!e.classIds || e.classIds.length === 0) return true;
          return e.classIds.some((c: any) => c._id === selectedChild?.classId || c === selectedChild?.classId);
        });

        const mapped = childEvents.map((e: any, index: number) => {
          let dateStr = e.startDate || e.date || '';
          if (dateStr && dateStr.includes('T')) {
            const d = new Date(dateStr);
            dateStr = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
          }

          let typeColor: BadgeStatus = 'info';
          const evType = (e.eventType || e.type || '').toLowerCase();
          if (evType === 'holiday') typeColor = 'error';
          else if (['meeting', 'workshop', 'general'].includes(evType)) typeColor = 'warning';
          else if (['celebration', 'competition', 'academic'].includes(evType)) typeColor = 'success';

          let timeStr = 'All Day';
          if (e.startTime) {
            timeStr = e.startTime;
            if (e.endTime) timeStr += ` - ${e.endTime}`;
          } else if (e.time) {
            timeStr = e.time;
          }

          const displayType = e.eventType 
            ? e.eventType.charAt(0).toUpperCase() + e.eventType.slice(1) 
            : (e.type || 'General');

          return {
            id: e._id || index.toString(),
            title: e.title || 'Event',
            date: dateStr,
            time: timeStr,
            venue: e.location || e.venue || 'School Campus',
            type: displayType,
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
        <Typography variant="h3" color={InnonshColors.primary}>{item.date.split(' ')[0]}</Typography>
        <Typography variant="caption" color={InnonshColors.textSecondary}>
          {item.date.split(' ').slice(1).join(' ')}
        </Typography>
      </View>
      <View style={styles.contentBlock}>
        <View style={styles.titleRow}>
          <Typography variant="h4" color={InnonshColors.textPrimary} style={{ flex: 1, marginRight: 8 }}>
            {item.title}
          </Typography>
          <StatusBadge label={item.type} status={item.typeColor} style={styles.badge} />
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color={InnonshColors.textSecondary} style={styles.icon} />
          <Typography variant="caption" color={InnonshColors.textSecondary}>{item.time}</Typography>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={16} color={InnonshColors.textSecondary} style={styles.icon} />
          <Typography variant="caption" color={InnonshColors.textSecondary}>{item.venue}</Typography>
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
    backgroundColor: InnonshColors.background,
  },
  listContent: {
    padding: InnonshSpacing.lg,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: InnonshColors.surface,
    borderRadius: InnonshRadius.lg,
    marginBottom: InnonshSpacing.lg,
    ...InnonshShadows.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: InnonshColors.border,
  },
  dateBlock: {
    width: 80,
    backgroundColor: InnonshColors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    padding: InnonshSpacing.md,
  },
  contentBlock: {
    flex: 1,
    padding: InnonshSpacing.lg,
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

