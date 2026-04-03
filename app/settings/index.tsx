import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Are you sure you want to clear the app cache?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Success', 'Cache cleared!') },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={22} color={APP_COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Get notified about orders and deals</Text>
              </View>
            </View>
            <Switch value={pushNotifs} onValueChange={setPushNotifs} trackColor={{ true: APP_COLORS.primary }} />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={22} color={APP_COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDesc}>Receive order updates via email</Text>
              </View>
            </View>
            <Switch value={emailNotifs} onValueChange={setEmailNotifs} trackColor={{ true: APP_COLORS.primary }} />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble" size={22} color={APP_COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDesc}>Get text messages for order updates</Text>
              </View>
            </View>
            <Switch value={smsNotifs} onValueChange={setSmsNotifs} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Switch to dark theme</Text>
              </View>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Services</Text>
                <Text style={styles.settingDesc}>Allow app to access your location</Text>
              </View>
            </View>
            <Switch value={locationServices} onValueChange={setLocationServices} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/notifications')}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Help Center</Text>
                <Text style={styles.settingDesc}>FAQs and support articles</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="call" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Contact Support</Text>
                <Text style={styles.settingDesc}>+94 77 035 9400</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="star" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rate Us</Text>
                <Text style={styles.settingDesc}>Leave a review on the app store</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDesc}>Free up storage space</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
            <View style={styles.settingLeft}>
              <Ionicons name="warning" size={22} color="#EF4444" />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Delete Account</Text>
                <Text style={styles.settingDesc}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Big Plate v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: APP_COLORS.card,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    overflow: 'hidden',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: APP_COLORS.text, marginBottom: 12, paddingHorizontal: 4 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: APP_COLORS.text },
  settingDesc: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 2 },
  dangerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  versionText: { textAlign: 'center', fontSize: 13, color: APP_COLORS.textSecondary, paddingVertical: 20 },
});
