import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, Dumbbell, Map, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useChildSession } from '@/contexts/ChildSessionContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SwipableTabs } from '@/components/navigation/SwipableTabs';

export default function ChildLayout() {
  const { t } = useTranslation();
  const { child, loading, isIndependent } = useChildSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !child) {
      router.replace(isIndependent ? '/role-selection' : '/child-login');
    }
  }, [loading, child, isIndependent, router]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!child) {
    return null;
  }

  const tabBarHeight = Platform.select({
    ios: 75 + insets.bottom,
    android: 70,
    default: 70,
  });

  const tabBarPaddingBottom = Platform.select({
    ios: Math.max(insets.bottom, 8),
    android: 12,
    default: 8,
  });

  return (
    <SwipableTabs
      screenOptions={{
        tabBarPosition: 'bottom',
        tabBarScrollEnabled: false,
        swipeEnabled: true,
        lazy: true,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarPressColor: 'transparent',
        tabBarIndicatorStyle: {
          backgroundColor: '#10B981',
          height: 3,
          borderRadius: 2,
          position: 'absolute',
          top: 0,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: tabBarPaddingBottom,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 2,
          height: tabBarHeight - tabBarPaddingBottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'none',
          marginTop: 2,
          marginBottom: Platform.select({
            ios: 0,
            android: 4,
            default: 2,
          }),
        },
        tabBarIconStyle: {
          marginTop: Platform.select({
            ios: 2,
            android: 0,
            default: 0,
          }),
        },
      }}
    >
      <SwipableTabs.Screen
        name="home"
        options={{
          title: t('child_navigation.tabs.home'),
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <SwipableTabs.Screen
        name="library"
        options={{
          title: t('child_navigation.tabs.library'),
          tabBarIcon: ({ color }) => <Dumbbell size={22} color={color} />,
        }}
      />
      <SwipableTabs.Screen
        name="path"
        options={{
          title: t('child_navigation.tabs.path'),
          tabBarIcon: ({ color }) => <Map size={22} color={color} />,
        }}
      />
      <SwipableTabs.Screen
        name="profile"
        options={{
          title: t('child_navigation.tabs.profile'),
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </SwipableTabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
});
