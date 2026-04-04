import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';

const SETTINGS_KEY = 'bigplate_settings';

interface Settings {
  pushNotifs: boolean;
  emailNotifs: boolean;
  smsNotifs: boolean;
  darkMode: boolean;
  locationServices: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  pushNotifs: true,
  emailNotifs: false,
  smsNotifs: false,
  darkMode: false,
  locationServices: true,
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        setSettings(JSON.parse(data));
      }
    };
    loadSettings();
  }, []);

  const saveSetting = useCallback(async (key: keyof Settings, value: boolean) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  }, [settings]);

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'This will clear all locally stored data including your cart. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          const keys = await AsyncStorage.getAllKeys();
          await AsyncStorage.multiRemove(keys);
          Alert.alert('Success', 'Cache cleared! Please sign in again.');
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data including orders, addresses, and favorites will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setLoading(true);
            try {
              // Delete user data
              await supabase.from('addresses').delete().eq('user_id', user.id);
              await supabase.from('favorites').delete().eq('user_id', user.id);
              await supabase.from('orders').delete().eq('user_id', user.id);
              await supabase.from('users').delete().eq('id', user.id);
              await supabase.auth.admin.deleteUser(user.id);
              await AsyncStorage.clear();
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
                { text: 'OK', onPress: () => router.replace('/auth/login') },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not delete account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('tel:+94770359400');
  };

  const handleRateUs = () => {
    Alert.alert('Rate Big Plate', 'Thank you for your support! Please rate us on the app store.', [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Rate Now', onPress: () => Linking.openURL('https://play.google.com/store/apps') },
    ]);
  };

  const handleHelpCenter = () => {
    Alert.alert(
      'Help Center',
      'Need help? Contact us:\n\n📞 +94 77 035 9400\n📧 support@bigplate.lk\n🕐 Mon-Sun: 10AM - 11PM',
      [{ text: 'OK' }]
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
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: APP_COLORS.primary }} />
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
            <Switch value={settings.locationServices} onValueChange={(v) => saveSetting('locationServices', v)} trackColor={{ true: APP_COLORS.primary }} />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleHelpCenter}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Help Center</Text>
                <Text style={styles.settingDesc}>FAQs and support articles</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleContactSupport}>
            <View style={styles.settingLeft}>
              <Ionicons name="call" size={22} color={APP_COLORS.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Contact Support</Text>
                <Text style={styles.settingDesc}>+94 77 035 9400</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleRateUs}>
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

        {/* Account */}
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
                {loading ? (
                  <ActivityIndicator color="#EF4444" />
                ) : (
                  <Ionicons name="warning" size={22} color="#EF4444" />
                )}
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
