import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useChildSession } from '@/contexts/ChildSessionContext';

export default function SplashScreen() {
  const router = useRouter();
  const { loading: authLoading, profile } = useAuth();
  const { loading: childLoading, child } = useChildSession();
  const [isSplashReady, setIsSplashReady] = useState(false);

  const loading = authLoading || childLoading;
  const isParent = !!profile;
  const isChild = !!child;

  // Start minimum splash timer on mount (runs in parallel with data loading)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashReady(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Navigate when BOTH conditions are met: data loaded AND minimum time elapsed
  useEffect(() => {
    if (!loading && isSplashReady) {
      if (isParent) {
        router.replace('/(parent)/home');
      } else if (isChild) {
        router.replace('/(child)/home');
      } else {
        router.replace('/role-selection');
      }
    }
  }, [loading, isSplashReady, isParent, isChild, router]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zoomi</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
