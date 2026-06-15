import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, GraduationCap, ChevronLeft } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/colors';
import { useChildStore, Child } from '../../store/childStore';
import { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function ChildrenScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { children, fetchChildren } = useChildStore();
  const [refreshing, setRefreshing] = useState(false);

  // Entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideYAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideYAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChildren();
    setRefreshing(false);
  }, [fetchChildren]);

  const renderItem = ({ item, index }: { item: Child, index: number }) => {
    // Staggered delay based on index
    const itemFade = new Animated.Value(0);
    const itemSlide = new Animated.Value(30);

    Animated.parallel([
      Animated.timing(itemFade, { toValue: 1, duration: 500, delay: index * 100, useNativeDriver: true }),
      Animated.spring(itemSlide, { toValue: 0, tension: 50, friction: 8, delay: index * 100, useNativeDriver: true })
    ]).start();

    return (
      <Animated.View style={{ opacity: itemFade, transform: [{ translateY: itemSlide }] }}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ChildDetail', { childId: item._id })}
        >
          <View style={styles.cardAccentLine} />

          <Avatar name={item.name} size={64} style={styles.avatar} />

          <View style={styles.cardContent}>
            <Typography variant="h3" weight="bold" color={Colors.textPrimary} style={styles.name}>
              {item.name}
            </Typography>

            <View style={styles.infoRow}>
              <GraduationCap color={Colors.primary} size={16} />
              <Typography variant="body" color={Colors.textSecondary} style={{ marginLeft: 6 }}>
                Class: {item.className}
              </Typography>
            </View>

            <Typography variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
              Adm No: {item.admissionNo}
            </Typography>
          </View>

          <View style={styles.iconButton}>
            <ChevronRight color={Colors.primary} size={24} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={[Colors.primary, '#4338CA']} // Dark indigo gradient
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Abstract shapes */}
        <View style={styles.headerShape1} />
        <View style={styles.headerShape2} />

        <Animated.View style={[styles.headerContent, { opacity: fadeAnim, transform: [{ translateY: slideYAnim }] }]}>
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
              My Children
            </Typography>
          </View>
          <Typography variant="body" color="rgba(255,255,255,0.8)" style={{ marginTop: 4 }}>
            Monitor and manage your kids' progress
          </Typography>
        </Animated.View>
      </View>

      <FlatList
        data={children}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        ListEmptyComponent={
          <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
            <Typography variant="body" color={Colors.textSecondary} align="center">
              No children linked to this account yet.
            </Typography>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
    backgroundColor: Colors.primary,
  },
  headerShape1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerShape2: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  backButton: {
    marginRight: 10,
    marginLeft: -6,
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Leave room for floating tab bar
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
    overflow: 'hidden', // to keep the accent line inside
  },
  cardAccentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: Colors.primary,
  },
  avatar: {
    marginRight: 20,
    marginLeft: 4, // push slightly away from accent line
    borderWidth: 2,
    borderColor: 'rgba(79, 70, 229, 0.1)', // subtle primary border
  },
  cardContent: {
    flex: 1,
  },
  name: {
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(79, 70, 229, 0.08)', // very light primary
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

