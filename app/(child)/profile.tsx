import { View, Text, TouchableOpacity, StyleSheet, ScrollView, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useChildSession } from '@/contexts/ChildSessionContext';
import { Globe, LogOut, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const router = useRouter();
  const { child, clearChildSession } = useChildSession();
  const { t, i18n } = useTranslation();

  const getInitials = (name: string): string => {
    const parts = name?.split(' ') || [];
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase()}${parts[1].charAt(0).toUpperCase()}`;
    }
    return name?.charAt(0)?.toUpperCase() || 'C';
  };

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'he' ? 'en' : 'he';
    await i18n.changeLanguage(newLang);
    I18nManager.forceRTL(newLang === 'he');
  };

  const handleSignOut = async () => {
    await clearChildSession();
    router.replace('/role-selection');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(child?.name || '')}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{child?.name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('child_profile.sections.settings')}</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Globe size={24} color="#10B981" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>{t('child_profile.language.title')}</Text>
                  <Text style={styles.settingDescription}>
                    {i18n.language === 'he'
                      ? t('child_profile.language.current_hebrew')
                      : t('child_profile.language.current_english')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.languageToggleButton} onPress={toggleLanguage}>
                <Text style={styles.languageToggleButtonText}>
                  {i18n.language === 'he' ? 'EN' : 'HE'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={24} color="#FFFFFF" />
            <Text style={styles.signOutButtonText}>{t('child_profile.sign_out')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  languageToggleButton: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageToggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
