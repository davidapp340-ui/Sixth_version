import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChildSession } from '@/contexts/ChildSessionContext';
import { ArrowLeft, Rocket } from 'lucide-react-native';
import * as Device from 'expo-device';
import { useTranslation } from 'react-i18next';
import { checkChildSessionLock } from '@/lib/sessionLock';

export default function ChildLoginScreen() {
  const router = useRouter();
  const { linkChildWithCode } = useChildSession();
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');

    if (!code || code.length !== 6) {
      setError(t('child_login.errors.invalid_code'));
      return;
    }

    setLoading(true);

    try {
      const deviceId = Device.modelId || Device.osInternalBuildId || 'unknown';
      const { child, error: linkError } = await linkChildWithCode(
        code.toUpperCase(),
        deviceId
      );

      if (linkError) {
        setError(linkError.message || t('child_login.errors.code_invalid_or_expired'));
      } else if (child) {
        const lockResult = await checkChildSessionLock(child.id);
        if (lockResult.locked) {
          setError(t('session_lock.blocked_message'));
          return;
        }
        router.replace('/(child)/home');
      }
    } catch (err) {
      setError(t('child_login.errors.unexpected_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f1ea" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* כפתור חזור מעוצב */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={28} color="#408960" />
        </TouchableOpacity>

        <View style={styles.content}>
          
          {/* דמות מזמינה לילד */}
          <Image 
            source={require('@/assets/images/avatars/astronaut.png')} 
            style={styles.avatar}
            resizeMode="contain"
          />

          <Text style={styles.title}>{t('child_login.title')}</Text>
          <Text style={styles.subtitle}>{t('child_login.subtitle')}</Text>
          <Text style={styles.instructions}>
            {t('child_login.instructions')}
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* שדה הזנת קוד בסגנון "קוד סודי" */}
          <TextInput
            style={styles.input}
            placeholder="******"
            placeholderTextColor="#A1D0B6"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={6}
            editable={!loading}
            keyboardType="default"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.connectButton, loading && styles.connectButtonDisabled]}
            onPress={handleConnect}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.connectButtonText}>{t('child_login.connect_button')}</Text>
                <Rocket size={24} color="#FFFFFF" style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f1ea',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16, // דוחף מעט למטה מהקצה העליון
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: 'flex-start',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
    // הסרנו את ה-flex: 1 ו-justifyContent: center כדי שהתוכן יעלה למעלה
  },
  avatar: {
    width: 130, // הקטנו מעט כדי לשמור על פרופורציות
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#408960',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#555555',
    marginBottom: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructions: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
    fontSize: 32,
    marginBottom: 28,
    borderWidth: 3,
    borderColor: '#408960',
    width: '100%',
    textAlign: 'center',
    letterSpacing: 12,
    fontWeight: '900',
    color: '#333333',
    shadowColor: '#408960',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  connectButton: {
    backgroundColor: '#408960',
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  connectButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#7DBA98',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  buttonIcon: {
    marginLeft: 12,
  },
});