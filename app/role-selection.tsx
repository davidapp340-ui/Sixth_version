import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Baby, UserCircle, ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          <View style={styles.header}>
            <Text style={styles.title}>{t('role_selection.title')}</Text>
            <Text style={styles.subtitle}>{t('role_selection.subtitle')}</Text>
          </View>

          <View style={styles.cardsContainer}>
            {/* כרטיסיית הורים */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push('/parent-auth')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Users size={32} color="#0284C7" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{t('role_selection.parent_button')}</Text>
                <Text style={styles.cardSubtitle}>{t('role_selection.parent_subtitle')}</Text>
              </View>
              <ChevronLeft size={24} color="#CBD5E1" />
            </TouchableOpacity>

            {/* כרטיסיית מתאמן עצמאי */}
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push('/independent-login')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F1F5F9' }]}>
                <UserCircle size={32} color="#475569" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{t('role_selection.independent_button')}</Text>
                <Text style={styles.cardSubtitle}>{t('role_selection.independent_subtitle')}</Text>
              </View>
              <ChevronLeft size={24} color="#CBD5E1" />
            </TouchableOpacity>

            {/* כרטיסיית ילדים */}
            <TouchableOpacity
              style={[styles.card, styles.childCard]}
              activeOpacity={0.8}
              onPress={() => router.push('/child-login')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Baby size={32} color="#059669" />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{t('role_selection.child_button')}</Text>
                <Text style={styles.cardSubtitle}>{t('role_selection.child_subtitle')}</Text>
              </View>
              <ChevronLeft size={24} color="#A7F3D0" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC', // רקע אפור-כחלחל נקי
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: '80%',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  childCard: {
    borderColor: '#D1FAE5',
    borderWidth: 2,
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16, // רווח משמאל כי אנחנו מימין לשמאל (RTL)
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'right', // יישור לימין לטקסט בעברית
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'right',
  },
});