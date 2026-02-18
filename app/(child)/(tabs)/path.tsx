import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Check, Lock, Star, Gift } from 'lucide-react-native';
import { useChildSession } from '@/contexts/ChildSessionContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import React from 'react';

type DailyPlan = Database['public']['Tables']['daily_plans']['Row'];
type Child = Database['public']['Tables']['children']['Row'];

const NODE_SIZE = 60;

const THEME_BACKGROUNDS = {
  forest: ['#1E3A20', '#2D5016', '#4A7C59'],
  ocean: ['#0C2D48', '#145DA0', '#2E8BC0'],
  desert: ['#8B4513', '#CD853F', '#DEB887'],
  mountain: ['#4A5568', '#718096', '#A0AEC0'],
};

export default function PathScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { child, loading: sessionLoading } = useChildSession();
  const { width: screenWidth } = useWindowDimensions();
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [claimingTreasure, setClaimingTreasure] = useState(false);

  const PATH_WIDTH = screenWidth - 80;

  const fetchData = async () => {
    if (!child?.id || !child?.track_level) {
      return;
    }

    try {
      setDataLoading(true);
      setLoadError(false);

      const { data: plans, error: plansError } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('track_level', child.track_level)
        .order('day_number', { ascending: true });

      if (plansError) throw plansError;
      setDailyPlans(plans || []);
    } catch (error) {
      console.error('Error fetching path data:', error);
      setLoadError(true);
    } finally {
      setDataLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (child?.id) {
        fetchData();
      }
    }, [child?.id])
  );

  const handleNodePress = async (day: number, plan: DailyPlan | undefined) => {
    if (!child) return;

    if (day !== child.path_day) {
      return;
    }

    if (!plan) {
      Alert.alert(
        t('path.coming_soon_title', { defaultValue: 'Coming Soon' }),
        t('path.coming_soon_message', { defaultValue: 'This day\'s exercises are not available yet. Check back soon!' })
      );
      return;
    }

    const isRestDay = [7, 14, 21, 28].includes(day);

    if (isRestDay) {
      await handleClaimTreasure();
    } else {
      router.push({
        pathname: '/exercise-player',
        params: { planId: plan.id }
      });
    }
  };

  const handleClaimTreasure = async () => {
    if (!child?.id || claimingTreasure) return;

    try {
      setClaimingTreasure(true);

      const { data, error } = await supabase.rpc('claim_treasure_bonus', {
        p_child_id: child.id
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data) {
        if (data.success) {
          Alert.alert(
            '🎉 ' + t('path.treasure_claimed'),
            t('path.treasure_points', { points: data.points_earned || 50 }),
            [{ text: t('common.ok'), onPress: fetchData }]
          );
        } else {
          Alert.alert(t('common.error'), data.error || t('path.treasure_error'));
        }
      }
    } catch (error) {
      console.error('Error claiming treasure:', error);
      Alert.alert(t('common.error'), t('path.treasure_error'));
    } finally {
      setClaimingTreasure(false);
    }
  };

  const getNodePosition = (index: number, pathWidth: number) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const isEvenRow = row % 2 === 0;

    const x = isEvenRow ? col * (pathWidth / 4) : (4 - col) * (pathWidth / 4);
    const y = row * 100;

    return { x, y };
  };

  const renderNode = (day: number, index: number) => {
    if (!child) return null;

    const plan = dailyPlans.find(p => p.day_number === day);
    const position = getNodePosition(index, PATH_WIDTH);
    const isRestDay = [7, 14, 21, 28].includes(day);
    const isPast = day < child.path_day;
    const isCurrent = day === child.path_day;
    const isFuture = day > child.path_day;

    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.nodeContainer,
          {
            left: position.x,
            top: position.y,
          }
        ]}
        onPress={() => handleNodePress(day, plan)}
        disabled={!isCurrent}
        activeOpacity={isCurrent ? 0.7 : 1}
      >
        {isCurrent && !isRestDay && (
          <View style={styles.avatarContainer}>
            <Star size={32} color="#FFD700" fill="#FFD700" />
          </View>
        )}

        {isRestDay ? (
          <TreasureNode
            isPast={isPast}
            isCurrent={isCurrent}
            isFuture={isFuture}
          />
        ) : (
          <DayNode
            day={day}
            isPast={isPast}
            isCurrent={isCurrent}
            isFuture={isFuture}
            title={plan?.title}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (sessionLoading || dataLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('common.session_error', { defaultValue: 'Session error. Please log in again.' })}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => router.replace('/child-login')}
          >
            <Text style={styles.errorButtonText}>{t('common.go_to_login', { defaultValue: 'Go to Login' })}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('common.error_loading_data')}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={fetchData}
          >
            <Text style={styles.errorButtonText}>{t('common.retry', { defaultValue: 'Retry' })}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const themeColors = (THEME_BACKGROUNDS[child.path_theme_id as keyof typeof THEME_BACKGROUNDS] || THEME_BACKGROUNDS.forest) as [string, string, string];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={themeColors}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>{t('path.title', { defaultValue: 'Your Journey' })}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t('path.day')}</Text>
            <Text style={styles.statValue}>{child.path_day}/30</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t('path.streak')}</Text>
            <Text style={styles.statValue}>🔥 {child.current_streak}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t('path.points')}</Text>
            <Text style={styles.statValue}>⭐ {child.total_points}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.pathContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.pathWrapper, { width: PATH_WIDTH }]}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day, index) =>
            renderNode(day, index)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function DayNode({
  day,
  isPast,
  isCurrent,
  isFuture,
  title
}: {
  day: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  title?: string;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCurrent) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.nodeWrapper}>
      <Animated.View
        style={[
          styles.node,
          isPast && styles.nodePast,
          isCurrent && styles.nodeCurrent,
          isFuture && styles.nodeFuture,
          isCurrent && animatedStyle,
        ]}
      >
        {isPast && <Check size={24} color="#FFFFFF" strokeWidth={3} />}
        {isCurrent && <Text style={styles.nodeTextCurrent}>{day}</Text>}
        {isFuture && <Lock size={20} color="#9CA3AF" />}
      </Animated.View>
      {title && isCurrent && (
        <Text style={styles.nodeTitle} numberOfLines={2}>
          {title}
        </Text>
      )}
    </View>
  );
}

function TreasureNode({
  isPast,
  isCurrent,
  isFuture
}: {
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isCurrent) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 200 }),
          withTiming(10, { duration: 400 }),
          withTiming(0, { duration: 200 })
        ),
        -1,
        false
      );
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.nodeWrapper}>
      <Animated.View
        style={[
          styles.treasureNode,
          isPast && styles.treasurePast,
          isCurrent && styles.treasureCurrent,
          isFuture && styles.treasureFuture,
          isCurrent && animatedStyle,
        ]}
      >
        <Gift
          size={32}
          color={isFuture ? '#9CA3AF' : '#FFD700'}
          fill={isPast ? '#FFD700' : 'none'}
        />
      </Animated.View>
      {isCurrent && (
        <Text style={styles.treasureLabel}>Tap to open!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  pathContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  pathWrapper: {
    position: 'relative',
    height: 620,
    alignSelf: 'center',
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  nodeWrapper: {
    alignItems: 'center',
    width: NODE_SIZE + 40,
  },
  avatarContainer: {
    position: 'absolute',
    top: -40,
    zIndex: 10,
  },
  node: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  nodePast: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  nodeCurrent: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  nodeFuture: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  nodeTextCurrent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  nodeTitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: 80,
  },
  treasureNode: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  treasurePast: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  treasureCurrent: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  treasureFuture: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  treasureLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
