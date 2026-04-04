import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';

const SETTINGS_KEY = 'bigplate_settings';

interface Settings {
  pushNotifs: boolean;
  emailNotifs: boolean;
  smsNotifs: boolean;
  locationServices: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  pushNotifs: true,
  emailNotifs: false,
  smsNotifs: false,
  locationServices: true,
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: c.card },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { backgroundColor: c.card, borderRadius: 16, marginBottom: 16, paddingLeft:10, paddingTop:10, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12, paddingHorizontal: 4 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: c.text },
  settingDesc: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
  dangerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  versionText: { textAlign: 'center', fontSize: 13, color: c.textSecondary, paddingVertical: 20 },
});

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showAlert } = useThemedAlert();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      let localData = null;
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) localData = JSON.parse(data);

      if (user) {
        try {
          const { data: dbData } = await supabase.from('users').select('push_notifications, email_notifications, sms_notifications').eq('id', user.id).single();
          if (dbData) {
            setSettings({
              pushNotifs: dbData.push_notifications ?? true,
              emailNotifs: dbData.email_notifications ?? false,
              smsNotifs: dbData.sms_notifications ?? false,
              locationServices: localData?.locationServices ?? true,
            });
          } else if (localData) {
            setSettings(localData);
          }
        } catch {
          if (localData) setSettings(localData);
        }
      } else if (localData) {
        setSettings(localData);
      }
    };
    loadSettings();
  }, [user]);

  const saveSetting = useCallback(async (key: keyof Settings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

    // Save to database if logged in
    if (user) {
      const dbKey = key === 'pushNotifs' ? 'push_notifications' : key === 'emailNotifs' ? 'email_notifications' : 'sms_notifications';
      await supabase.from('users').update({ [dbKey]: value }).eq('id', user.id);
    }
  }, [settings, user]);

  const handleClearCache = () => {
    showAlert('Clear Cache', 'This will clear all locally stored data including your cart. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        const keys = await AsyncStorage.getAllKeys();
        await AsyncStorage.multiRemove(keys);
        showAlert('Success', 'Cache cleared! Please sign in again.');
        router.replace('/(tabs)');
      }},
    ]);
  };

  const handleDeleteAccount = () => {
    showAlert('Delete Account', 'This action cannot be undone. All your data including orders, addresses, and favorites will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (!user) return;
        setLoading(true);
        try {
          await supabase.from('addresses').delete().eq('user_id', user.id);
          await supabase.from('favorites').delete().eq('user_id', user.id);
          await supabase.from('orders').delete().eq('user_id', user.id);
          await supabase.from('users').delete().eq('id', user.id);
          await supabase.auth.admin.deleteUser(user.id);
          await AsyncStorage.clear();
          showAlert('Account Deleted', 'Your account has been permanently deleted.', [{ text: 'OK', onPress: () => router.replace('/auth/login') }]);
        } catch (error: any) {
          showAlert('Error', error.message || 'Could not delete account');
        } finally {
          setLoading(false);
        }
      }},
    ]);
  };

  const handleContactSupport = () => { Linking.openURL('tel:+94770359400'); };

  const handleRateUs = () => {
    showAlert('Rate Big Plate', 'Thank you for your support! Please rate us on the app store.', [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Rate Now', onPress: () => Linking.openURL('https://play.google.com/store/apps') },
    ]);
  };

  const handleHelpCenter = () => {
    showAlert('Help Center', 'Need help? Contact us:\n\n📞 +94 77 035 9400\n📧 support@bigplate.lk\n🕐 Mon-Sun: 10AM - 11PM', [{ text: 'OK' }]);
  };

  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
            <Switch value={settings.pushNotifs} onValueChange={(v) => saveSetting('pushNotifs', v)} trackColor={{ true: APP_COLORS.primary }} />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail" size={22} color={APP_COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDesc}>Receive order updates via email</Text>
              </View>
            </View>
            <Switch value={settings.emailNotifs} onValueChange={(v) => saveSetting('emailNotifs', v)} trackColor={{ true: APP_COLORS.primary }} />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="chatbubble" size={22} color={APP_COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDesc}>Get text messages for order updates</Text>
              </View>
            </View>
            <Switch value={settings.smsNotifs} onValueChange={(v) => saveSetting('smsNotifs', v)} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={22} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Switch to dark theme</Text>
              </View>
            </View>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location" size={22} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Services</Text>
                <Text style={styles.settingDesc}>Allow app to access your location</Text>
              </View>
            </View>
            <Switch value={settings.locationServices} onValueChange={(v) => saveSetting('locationServices', v)} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleHelpCenter}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={22} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Help Center</Text>
                <Text style={styles.settingDesc}>FAQs and support articles</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
            <View style={styles.settingLeft}>
              <Ionicons name="call" size={22} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Contact Support</Text>
                <Text style={styles.settingDesc}>+94 77 035 9400</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleRateUs}>
            <View style={styles.settingLeft}>
              <Ionicons name="star" size={22} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Rate Us</Text>
                <Text style={styles.settingDesc}>Leave a review on the app store</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={22} color={colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDesc}>Free up storage space</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.settingItem} onPress={signOut}>
              <View style={styles.settingLeft}>
                <Ionicons name="log-out" size={22} color={APP_COLORS.primary} />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: APP_COLORS.primary }]}>Sign Out</Text>
                  <Text style={styles.settingDesc}>Sign out of your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={APP_COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount} disabled={loading}>
              <View style={styles.settingLeft}>
                {loading ? <ActivityIndicator color="#EF4444" /> : <Ionicons name="warning" size={22} color="#EF4444" />}
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Delete Account</Text>
                  <Text style={styles.settingDesc}>Permanently delete your account</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.versionText}>Big Plate v{Application.nativeAppVersion || '1.0.0'}</Text>
      </ScrollView>
    </View>
  );
}
