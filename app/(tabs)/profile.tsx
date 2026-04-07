import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS, BRANCHES } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import { useNotifications } from '../../src/context/NotificationContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 50 },
  scrollContent: { paddingBottom: 100 },
  authPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  authTitle: { fontSize: 22, fontWeight: '700', color: c.text, marginTop: 16 },
  authSubtitle: { fontSize: 14, color: c.textSecondary, marginTop: 8, textAlign: 'center' },
  loginButton: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
    width: '100%',
  },
  loginText: { color: '#FFF', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  signupButton: {
    borderWidth: 2,
    borderColor: APP_COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
    width: '100%',
  },
  signupText: { color: APP_COLORS.primary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  profileHeader: { alignItems: 'center', paddingVertical: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: APP_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 12 },
  email: { fontSize: 14, color: c.textSecondary, marginTop: 4 },
  section: {
    backgroundColor: c.card,
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    gap: 12,
  },
  menuItemText: { flex: 1, fontSize: 15, color: c.text },
  notifBadge: { backgroundColor: APP_COLORS.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  notifBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  branches: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 12 },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: c.border,
    gap: 12,
  },
  branchInfo: { flex: 1 },
  branchName: { fontSize: 15, fontWeight: '600', color: c.text },
  branchAddress: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFF0F0',
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: APP_COLORS.primary },
});

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const { unreadCount } = useNotifications();
  const [userName, setUserName] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const styles = createStyles(colors);

  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      try {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single();
        if (data?.name) setUserName(data.name);
      } catch (error) {
        console.error('Failed to fetch user name:', error);
      }
    };
    fetchUserName();
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Error', error.message);
      setSigningOut(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Ionicons name="person-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.authTitle}>Sign in to your account</Text>
          <Text style={styles.authSubtitle}>
            Track orders, save addresses, and get exclusive deals
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/auth/signup')}>
            <Text style={styles.signupText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const displayName = userName || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
    const displayEmail = user.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{displayEmail}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/details')}>
          <Ionicons name="person" size={22} color={APP_COLORS.primary} />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/address')}>
          <Ionicons name="location" size={22} color={APP_COLORS.primary} />
          <Text style={styles.menuItemText}>My Addresses</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')}>
          <Ionicons name="heart" size={22} color={APP_COLORS.primary} />
          <Text style={styles.menuItemText}>Favorites</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/promotions')}>
          <Ionicons name="gift" size={22} color={APP_COLORS.primary} />
          <Text style={styles.menuItemText}>Promotions</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications" size={22} color={colors.textSecondary} />
          <Text style={styles.menuItemText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>{unreadCount}</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.branches}>
        <Text style={styles.sectionTitle}>Our Branches</Text>
        {BRANCHES.map((branch) => (
          <View key={branch.id} style={styles.branchCard}>
            <Ionicons name="restaurant" size={20} color={APP_COLORS.primary} />
            <View style={styles.branchInfo}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchAddress}>{branch.address}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut} disabled={signingOut}>
        {signingOut ? (
          <ActivityIndicator color={APP_COLORS.primary} />
        ) : (
          <>
            <Ionicons name="log-out" size={20} color={APP_COLORS.primary} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
