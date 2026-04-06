import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { APP_COLORS } from '../../src/constants';

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: c.card },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { backgroundColor: c.card, borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: c.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 12 },
  text: { fontSize: 15, color: c.textSecondary, lineHeight: 24, marginBottom: 12 },
  boldText: { fontSize: 15, fontWeight: '600', color: c.text, marginBottom: 8 },
  list: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  bullet: { fontSize: 15, color: APP_COLORS.primary, marginTop: 4 },
  listText: { fontSize: 15, color: c.textSecondary, lineHeight: 22, flex: 1 },
  versionText: { textAlign: 'center', fontSize: 13, color: c.textSecondary, marginTop: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: APP_COLORS.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: c.textSecondary },
  tabTextActive: { color: APP_COLORS.primary },
});

export default function TermsPrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: c.card, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.tabActive]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.tabActive]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'terms' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms of Service</Text>
              <Text style={styles.text}>Last Updated: April 2026</Text>
              
              <Text style={styles.boldText}>1. Acceptance of Terms</Text>
              <Text style={styles.text}>By downloading, installing, or using the Big Plate application, you agree to be bound by these Terms of Service. If you do not agree, please do not use the app.</Text>

              <Text style={styles.boldText}>2. Use of the App</Text>
              <Text style={styles.text}>You may use Big Plate solely for ordering food and related services. You agree not to:</Text>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Use the app for any unlawful purpose.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Attempt to gain unauthorized access to our servers or user accounts.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Interfere with or disrupt the integrity of the app.</Text>
              </View>

              <Text style={styles.boldText}>3. Orders and Payments</Text>
              <Text style={styles.text}>All orders are subject to availability and confirmation. Prices are listed in Sri Lankan Rupees (LKR) and may change without notice. Payment is due at the time of delivery or as specified during checkout.</Text>

              <Text style={styles.boldText}>4. Cancellations and Refunds</Text>
              <Text style={styles.text}>You may cancel an order only while it is in "Pending" status. Once an order is confirmed or being prepared, it cannot be cancelled. Refunds are processed at the discretion of Big Plate management.</Text>

              <Text style={styles.boldText}>5. User Reviews</Text>
              <Text style={styles.text}>You may submit reviews for menu items. Reviews must be honest and respectful. Big Plate reserves the right to remove inappropriate content.</Text>

              <Text style={styles.boldText}>6. Limitation of Liability</Text>
              <Text style={styles.text}>Big Plate is not liable for any indirect, incidental, or consequential damages arising from the use of the app or the food ordered through it.</Text>

              <Text style={styles.boldText}>7. Contact Us</Text>
              <Text style={styles.text}>For questions about these terms, contact us at: support@bigplate.lk or call +94 77 035 9400.</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Policy</Text>
              <Text style={styles.text}>Last Updated: April 2026</Text>
              
              <Text style={styles.boldText}>1. Information We Collect</Text>
              <Text style={styles.text}>We collect information you provide directly, including:</Text>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Name, email address, and phone number.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Delivery addresses and order history.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Location data (only with your permission).</Text>
              </View>

              <Text style={styles.boldText}>2. How We Use Your Information</Text>
              <Text style={styles.text}>We use your data to:</Text>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Process and deliver your orders.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Send order updates and promotional offers.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Improve our services and user experience.</Text>
              </View>

              <Text style={styles.boldText}>3. Data Security</Text>
              <Text style={styles.text}>We use industry-standard encryption and secure servers to protect your personal information. Your payment details are never stored on our servers.</Text>

              <Text style={styles.boldText}>4. Sharing Your Information</Text>
              <Text style={styles.text}>We do not sell your personal data. We may share your delivery address and phone number with our delivery partners solely for the purpose of fulfilling your order.</Text>

              <Text style={styles.boldText}>5. Your Rights</Text>
              <Text style={styles.text}>You have the right to:</Text>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Access, update, or delete your personal data.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Opt-out of marketing communications at any time.</Text>
              </View>
              <View style={styles.list}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>Revoke location permissions in your device settings.</Text>
              </View>

              <Text style={styles.boldText}>6. Children's Privacy</Text>
              <Text style={styles.text}>Big Plate is not intended for children under 13. We do not knowingly collect personal information from children.</Text>

              <Text style={styles.boldText}>7. Contact Us</Text>
              <Text style={styles.text}>For privacy concerns, contact us at: support@bigplate.lk or call +94 77 035 9400.</Text>
            </View>
          </>
        )}

        <Text style={styles.versionText}>Big Plate v1.0.0</Text>
      </ScrollView>
    </View>
  );
}
