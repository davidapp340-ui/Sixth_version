import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Users, Baby, UserCircle } from 'lucide-react-native'; 

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // פונקציה עזר לרנדור כפתור מעוצב
  const renderRoleButton = (
    title: string, 
    subtitle: string,
    onPress: () => void, 
    backgroundColor: string, 
    IconComponent: React.ElementType
  ) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.buttonContent}>
        <View style={styles.iconContainer}>
          <IconComponent size={36} color="#FFFFFF" />
        </View>
        <View style={styles.buttonTextContainer}>
          <Text style={styles.buttonText}>{title}</Text>
          <Text style={styles.buttonSubtext}>{subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f1ea" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('role_selection.title')}</Text>
            <Text style={styles.subtitle}>{t('role_selection.subtitle')}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {renderRoleButton(
              t('role_selection.parent_button'),
              t('role_selection.parent_subtitle'),
              () => router.push('/parent-auth'),
              '#604abd', // צבע מקורי
              Users
            )}

            {renderRoleButton(
              t('role_selection.independent_button'),
              t('role_selection.independent_subtitle'),
              () => router.push('/independent-login'),
              '#c48c41', // צבע מקורי
              UserCircle
            )}

            {renderRoleButton(
              t('role_selection.child_button'),
              t('role_selection.child_subtitle'),
              () => router.push('/child-login'),
              '#408960', // צבע מקורי
              Baby
            )}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f1ea', // שמרנו על צבע הרקע החם
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
    // הוספת הצללה נעימה שעושה תחושה של כפתור אמיתי
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16, // מרווח בין האייקון לטקסט
    marginLeft: 8,
  },
  buttonTextContainer: {
    flex: 1, // גורם לטקסט לתפוס את שאר המקום ולשמור על יישור נכון
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  buttonSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
    lineHeight: 20,
  },
});