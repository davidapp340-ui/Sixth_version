import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Home, Map, Dumbbell, BookOpen, Settings } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useChildSession } from '@/contexts/ChildSessionContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function IndependentLayout() {
  const { t } = useTranslation();
  const { child, loading, isIndependent } = useChildSession();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && (!child || !isIndependent)) {
      router.replace('/role-selection');
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0369A1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: Platform.select({
            ios: Math.max(insets.bottom, 8),
            android: 12,
            default: 8,
          }),
          height: Platform.select({
            ios: 80 + insets.bottom,
            android: 75,
            default: 75,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: Platform.select({
            ios: 0,
            android: 4,
            default: 2,
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 1,
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
      <Tabs.Screen
        name="home"
        options={{
          title: t('independent.tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="path"
        options={{
          title: t('independent.tabs.journey'),
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gallery"
        options={{
          title: t('independent.tabs.gallery'),
          tabBarIcon: ({ color, size }) => <Dumbbell size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="articles"
        options={{
          title: t('independent.tabs.articles'),
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('independent.tabs.settings'),
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="article/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
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
