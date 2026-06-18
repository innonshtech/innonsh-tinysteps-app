import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import {
    Bell,
    Trash2,
    CheckCircle2,
    Calendar,
    ClipboardList,
    CreditCard,
    UserCheck,
    X,
    Info,
    Clock,
    MapPin,
    Book,
    Award,
    ChevronLeft,
    FileText,
    Download,
    Share2
  } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Typography } from '../../components/ui/Typography';
import { Colors } from '../../constants/colors';
import { InnonshColors } from '../../theme/colors';
import { apiClient } from '../../api/client';
import { useNotificationStore } from '../../store/notificationStore';

// Custom Colors based on the image design
const UI_COLORS = {
  purple: '#6366F1',
  purpleDark: '#4338CA',
  purpleLight: '#EEF2FF',
  purpleDot: '#4F46E5',
  greenBg: '#F0FDF4',
  greenIcon: '#22C55E',
  redText: '#EF4444',
  grayBg: '#F8FAFC',
  badge: '#EF4444',
  itemBorder: '#6366F1'
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<any[]>([]);
  const { unreadCount, setUnreadCount, fetchUnreadCount } = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchNotifications = async (tab: 'all' | 'unread', isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    try {
      const endpoint = tab === 'unread' ? '/notifications?unread=true' : '/notifications';
      const response = await apiClient.get(endpoint);

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications(activeTab);
  }, [activeTab]);

  // Auto-refresh when unreadCount from store increases (new notification arrived)
  useEffect(() => {
    const localUnread = notifications.filter(n => !n.isRead).length;
    if (unreadCount > localUnread) {
      fetchNotifications(activeTab, true);
    }
  }, [unreadCount]);

  // Periodic refresh when screen is focused
  useEffect(() => {
     const interval = setInterval(() => {
        fetchNotifications(activeTab, true);
     }, 20000); // 20 seconds
     return () => clearInterval(interval);
  }, [activeTab]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(activeTab, true);
  }, [activeTab]);

  const handleMarkAsRead = async (id: string, alreadyRead: boolean) => {
    if (alreadyRead) return;

    try {
      const response = await apiClient.put('/notifications', { id, isRead: true });
      if (response.data.success) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      const response = await apiClient.put('/notifications', { markAllRead: true });
      if (response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;

    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.delete('/notifications?clearAll=true');
              if (response.data.success) {
                setNotifications([]);
                setUnreadCount(0);
              }
            } catch (e) {
              console.error('Failed to clear notifications', e);
            }
          }
        }
      ]
    );
  };

  const handleDeleteOne = async (id: string) => {
    try {
      const response = await apiClient.delete(`/notifications?id=${id}`, { data: { id } });
      if (response.data.success) {
        const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
        setNotifications(prev => prev.filter(n => n._id !== id));
        if (wasUnread) setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (e) {
      console.error('Failed to delete notification', e);
    }
  };

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'event': return { icon: Calendar, color: UI_COLORS.greenIcon, bg: UI_COLORS.greenBg };
      case 'exam': return { icon: ClipboardList, color: '#F59E0B', bg: '#FFFBEB' };
      case 'fee': return { icon: CreditCard, color: Colors.error, bg: '#FEF2F2' };
      case 'attendance': return { icon: UserCheck, color: UI_COLORS.purple, bg: UI_COLORS.purpleLight };
      case 'announcement': return { icon: Info, color: '#3B82F6', bg: '#EFF6FF' };
      default: return { icon: Bell, color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: any }) => {
    const { icon: Icon, color, bg } = getIconConfig(item.type);

    // Check for different metadata fields depending on type
    const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : (item.metadata || {});
    
    // Normalize date fields - Extremely robust keys
    const startDate = meta.startDate || meta.date || meta.start_date || meta['Start Date'] || meta.Date || meta.startdate;
    let endDate = meta.endDate || meta.end_date || meta.finishDate || meta['End Date'] || meta.enddate || meta.end || meta.to || meta.expiry || meta.DueDate;
    const time = meta.time || meta.startTime || meta.duration;

    // Fallback: If endDate is missing, try to find a second date in the message/description using regex
    if (!endDate && (item.message || item.description)) {
       const text = `${item.message} ${item.description}`;
       const dateMatches = text.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/g);
       if (dateMatches && dateMatches.length > 1) {
          // If we found multiple dates and one of them is the startDate, take the other as endDate
          if (dateMatches[0] === startDate) endDate = dateMatches[1];
          else if (dateMatches[1] !== startDate) endDate = dateMatches[1];
       }
    }
    
    // Robust recursive function to find any URL that looks like an image/attachment
    const findImageUrl = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === 'string' && obj.trim().startsWith('http')) return obj;
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = findImageUrl(item);
          if (found) return found;
        }
      }
      if (typeof obj === 'object') {
        // Prioritize common image keys
        const priorityKeys = ['url', 'image', 'imageUrl', 'photo', 'picture', 'path', 'uri', 'attachment'];
        for (const key of priorityKeys) {
          if (obj[key] && typeof obj[key] === 'string' && obj[key].trim().startsWith('http')) {
            return obj[key];
          }
        }
        // Search all keys
        for (const key in obj) {
          const found = findImageUrl(obj[key]);
          if (found) return found;
        }
      }
      return null;
    };

    const attachmentUrl = findImageUrl(meta);
    const isValidAttachment = !!attachmentUrl;
    
    const hasMetadata = startDate || endDate || time || meta.location || meta.subjects || meta.marks || Object.keys(meta).length > 0;

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        activeOpacity={0.8}
        onPress={() => handleMarkAsRead(item._id, item.isRead)}
      >
        <View style={[styles.iconContainer, { backgroundColor: bg }]}>
          <Icon size={24} color={color} />
          {!item.isRead && <View style={styles.unreadPulse} />}
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.titleWrapper}>
              <Typography variant="body" weight="bold" color={Colors.textPrimary} style={styles.itemTitle}>
                {item.title}
              </Typography>
              {isValidAttachment && (
                <FileText size={12} color={UI_COLORS.purple} style={{ marginLeft: 6, marginTop: 2 }} />
              )}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => handleDeleteOne(item._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <Typography variant="caption" color="#64748B" numberOfLines={1} style={styles.subtitle}>
            {item.description || item.message.split('\n')[0]}
          </Typography>

          {isValidAttachment && (
            <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedImage(attachmentUrl)}>
              <Image 
                source={{ uri: attachmentUrl }} 
                style={styles.eventImage} 
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {hasMetadata && (
            <View style={styles.metadataBox}>
              {/* Date & Schedule Row */}
              {(startDate || endDate) && (
                <View style={styles.metaRecord}>
                  <View style={styles.metaIconCircle}>
                    <Calendar size={14} color={UI_COLORS.purple} />
                  </View>
                  <View style={styles.metaTextGroup}>
                    <Typography variant="body" weight="bold" color="#334155" style={{ fontSize: 13 }}>
                      {startDate || 'Date'}
                      {endDate ? ` to ${endDate}` : ''}
                    </Typography>
                  </View>
                </View>
              )}

              {/* Time & Other Details */}
              <View style={styles.metadataGrid}>
                {time && (
                  <View style={styles.metaItemSmall}>
                    <Clock size={12} color={UI_COLORS.purple} style={styles.metaIcon} />
                    <Typography variant="label" weight="bold" color="#475569">{time}</Typography>
                  </View>
                )}
                {meta.location && (
                  <View style={styles.metaItemSmall}>
                    <MapPin size={12} color={UI_COLORS.redText} style={styles.metaIcon} />
                    <Typography variant="label" weight="bold" color={UI_COLORS.redText}>{meta.location}</Typography>
                  </View>
                )}
              </View>

              {/* Detailed Subject Schedule */}
              {Array.isArray(meta.schedule) && meta.schedule.length > 0 && (
                <View style={styles.scheduleContainer}>
                  <Typography variant="label" weight="bold" color="#64748B" style={styles.scheduleTitle}>
                    Subject Schedule:
                  </Typography>
                  {meta.schedule.map((s: any, idx: number) => (
                    <View key={idx} style={styles.scheduleItem}>
                      <View style={styles.scheduleDot} />
                      <View style={{ flex: 1 }}>
                        <Typography variant="label" weight="bold" color="#334155" style={{ fontSize: 11 }}>
                          {s.subject}
                        </Typography>
                        <Typography variant="label" color="#64748B" style={{ fontSize: 10 }}>
                          {s.date} • {s.startTime}{s.endTime ? ` - ${s.endTime}` : ''}
                        </Typography>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Exam Specifics (Subjects list/Marks) */}
              {(meta.subjects || meta.marks) && (
                <View style={styles.examBadgeRow}>
                  {meta.subjects && !meta.schedule && (
                    <View style={styles.examBadge}>
                      <Book size={10} color={UI_COLORS.purple} style={{ marginRight: 4 }} />
                      <Typography variant="label" weight="bold" color={UI_COLORS.purple} style={{ fontSize: 10 }}>
                        {meta.subjects}
                      </Typography>
                    </View>
                  )}
                  {meta.marks && (
                    <View style={[styles.examBadge, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
                      <Award size={10} color="#F59E0B" style={{ marginRight: 4 }} />
                      <Typography variant="label" weight="bold" color="#D97706" style={{ fontSize: 10 }}>
                        Max: {meta.marks}
                      </Typography>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.cardFooter}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={[styles.typeBadge, { backgroundColor: bg + '80' }]}>
                <Typography variant="label" weight="bold" color={color} style={{ fontSize: 9, textTransform: 'uppercase' }}>
                  {item.type}
                </Typography>
              </View>
              <View style={styles.footerDot} />
              <Typography variant="label" color="#94A3B8" style={{ fontSize: 10 }}>
                {formatTime(item.createdAt)}
              </Typography>
            </View>

            {isValidAttachment && (
              <TouchableOpacity 
                style={styles.attachmentBadge}
                onPress={() => setSelectedImage(attachmentUrl)}
              >
                <FileText size={12} color={UI_COLORS.purple} />
                <Typography variant="label" weight="bold" color={UI_COLORS.purple} style={{ fontSize: 9, marginLeft: 4 }}>
                  VIEW PHOTO
                </Typography>
              </TouchableOpacity>
            )}
            {/* Mark as Read Button - Only for Unread */}
            {!item.isRead && (
              <TouchableOpacity 
                style={styles.markReadBtn} 
                onPress={() => handleMarkAsRead(item._id, item.isRead)}
                activeOpacity={0.7}
              >
                 <CheckCircle2 size={12} color={UI_COLORS.purple} style={{ marginRight: 4 }} />
                 <Typography variant="label" weight="bold" color={UI_COLORS.purple} style={{ fontSize: 10 }}>
                    Mark as Read
                 </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Premium Header Container */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={[InnonshColors.primary, InnonshColors.primaryDark]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Circular Abstract Shapes for Depth */}
        <View style={styles.headerShape1} />
        <View style={styles.headerShape2} />

        <View style={styles.headerUpperInner}>
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
              Notifications
            </Typography>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerIcon} disabled={unreadCount === 0}>
              <CheckCircle2 color={unreadCount > 0 ? Colors.white : 'rgba(255,255,255,0.5)'} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClearAll} style={styles.headerIcon} disabled={notifications.length === 0}>
              <Trash2 color={notifications.length > 0 ? Colors.white : 'rgba(255,255,255,0.5)'} size={24} />
            </TouchableOpacity>
          </View>
        </View>
        <Typography variant="body" color="rgba(255,255,255,0.8)" style={styles.headerSubtitle}>
          Stay updated with school alerts
        </Typography>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Typography variant="body" weight="bold" color={activeTab === 'all' ? UI_COLORS.purple : Colors.textSecondary}>
            All
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Typography variant="body" weight="bold" color={activeTab === 'unread' ? UI_COLORS.purple : Colors.textSecondary}>
            Unread
          </Typography>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Typography variant="label" weight="bold" color={Colors.white} style={{ fontSize: 10 }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={UI_COLORS.purple} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[UI_COLORS.purple]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Bell color={Colors.textSecondary} size={48} opacity={0.3} />
              </View>
              <Typography variant="h3" weight="bold" color={Colors.textPrimary} style={{ marginBottom: 8 }}>
                {activeTab === 'unread' ? 'All Read!' : 'No Notifications'}
              </Typography>
              <Typography variant="body" color={Colors.textSecondary} align="center">
                {activeTab === 'unread'
                  ? "You don't have any unread messages right now."
                  : "When the school sends updates about exams, events, or fees, they'll appear here."}
              </Typography>
            </View>
          }
        />
      )}

      {/* Fullscreen Image Preview */}
      {selectedImage && (
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setSelectedImage(null)}
          >
            <X size={32} color="white" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.lightboxImage}
            resizeMode="contain"
          />
          <View style={styles.lightboxFooter}>
            <TouchableOpacity style={styles.lightboxAction}>
              <Share2 size={24} color="white" />
              <Typography variant="label" color="white" style={{ marginTop: 4 }}>Share</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.lightboxAction}>
              <Download size={24} color="white" />
              <Typography variant="label" color="white" style={{ marginTop: 4 }}>Save</Typography>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Very light grey bg
  },
  headerContainer: {
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: InnonshColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
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
  headerUpperInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    marginRight: 10,
    marginLeft: -6,
    padding: 4,
  },
  headerSubtitle: {
    paddingHorizontal: 24,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    marginTop: -16, // Overlap effect
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  tab: {
    paddingVertical: 14,
    marginRight: 24,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomColor: UI_COLORS.purple,
    borderRadius: 2,
  },
  badge: {
    backgroundColor: UI_COLORS.badge,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  unreadCard: {
    borderLeftWidth: 6,
    borderLeftColor: UI_COLORS.purple,
    backgroundColor: '#FBFCFF',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  unreadPulse: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: UI_COLORS.purpleDot,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginBottom: 12,
    fontSize: 13,
    opacity: 0.8,
  },
  closeBtn: {
    padding: 4,
    marginTop: -2,
  },
  metadataBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaIcon: {
    marginRight: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  markReadBtn: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.purpleLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: UI_COLORS.purple + '30',
  },
  metaRecord: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metaTextGroup: {
    flex: 1,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItemSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  examBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  scheduleContainer: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scheduleTitle: {
    fontSize: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  scheduleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UI_COLORS.purple,
    marginTop: 4,
    marginRight: 8,
  },
  eventImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#F1F5F9', // Placeholder color while loading
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.purpleLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lightbox: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1001,
  },
  lightboxImage: {
    width: '100%',
    height: '70%',
  },
  lightboxFooter: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  lightboxAction: {
    alignItems: 'center',
  },
});



