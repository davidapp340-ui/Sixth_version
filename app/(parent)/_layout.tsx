import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, Lightbulb, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ParentLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
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
            ios: 75 + insets.bottom,
            android: 70,
            default: 70,
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
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
          paddingHorizontal: 2,
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
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="science"
        options={{
          title: 'Science',
          tabBarIcon: ({ size, color }) => (
            <Lightbulb size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="article/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="child/[id]"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
  );
}
