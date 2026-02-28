import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
// ייבוא אייקונים כדי להפוך את הכפתורים למזמינים יותר
import { Users, Baby, UserCircle } from 'lucide-react-native'; 

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  // פונקציה עזר לרנדור כפתור מעוצב
  const renderRoleButton = (
    title: string, 
    onPress: () => void, 
    backgroundColor: string, 
    IconComponent: React.ElementType
  ) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.85} // אפקט לחיצה נעים
    >
      <View style={styles.buttonContent}>
        <IconComponent size={24} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f1ea" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          <Image
            source={require('@/assets/images/role_selection.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.textContainer}>
            <Text style={styles.title}>{t('role_selection.title')}</Text>
            <Text style={styles.subtitle}>{t('role_selection.subtitle')}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {renderRoleButton(
              t('role_selection.parent_button'),
              () => router.push('/parent-auth'),
              '#604abd', // צבע מקורי של ההורים
              Users
            )}

            {renderRoleButton(
              t('role_selection.independent_button'),
              () => router.push('/independent-login'),
              '#c48c41', // צבע מקורי של עצמאי
              UserCircle
            )}

            {renderRoleButton(
              t('role_selection.child_button'),
              () => router.push('/child-login'),
              '#408960', // צבע מקורי של ילדים
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
    backgroundColor: '#f4f1ea', // שמרנו על צבע הרקע החם והמקורי
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  image: {
    width: '100%',
    height: 280, // קצת יותר קטן כדי לתת מקום לטקסט
    marginBottom: 40,
  },
  textContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 34, // כותרת גדולה ובולטת
    fontWeight: '800', // משקל חזק
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
    gap: 18, // מרווח שווה בין הכפתורים
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24, // פינות מעוגלות יותר, למראה רך ומזמין
    // הוספת הצללה עדינה כדי לתת עומק
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6, // עבור אנדרואיד
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginLeft: 10, // רווח מהטקסט (RTL)
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
});