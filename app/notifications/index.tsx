import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useTheme } from '../../src/context/ThemeContext';
import { useNotifications } from '../../src/context/NotificationContext';
import { useAuth } from '../../src/context/AuthContext';
import type { ThemeColors } from '../../src/context/ThemeContext';

const NOTIF_COLORS: Record<string, { icon: string; bg: string; border: string; dot: string }> = {
  order: { icon: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', dot: '#3B82F6' },
  promo: { icon: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
  system: { icon: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', dot: '#6B7280' },
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: c.card },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  markAllText: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '600' },
  list: { padding: 20, paddingBottom: 100 },
  notifCard: { flexDirection: 'row', backgroundColor: c.card, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border, gap: 12 },
  notifCardUnread: { borderWidth: 2 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  notifTitleUnread: { fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifMessage: { fontSize: 13, color: c.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 12, color: c.textSecondary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: c.textSecondary, marginTop: 8 },
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { notifications, unreadCount, loading, markAsRead, markAllRead, fetchNotifications } = useNotifications();
  const styles = createStyles(colors);

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return 'receipt';
      case 'promo': return 'gift';
      default: return 'information-circle';
    }
  };

  const getNotifColors = (type: string) => NOTIF_COLORS[type] || NOTIF_COLORS.system;

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySubtitle}>Please sign in to view notifications</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={APP_COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchNotifications}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const nc = getNotifColors(item.type);
          const isUnread = !item.is_read;
          return (
            <TouchableOpacity
              style={[
                styles.notifCard,
                { backgroundColor: nc.bg, borderColor: nc.border },
                isUnread && { borderWidth: 2 },
              ]}
              onPress={() => markAsRead(item.id)}
            >
              <View style={[styles.iconContainer, { backgroundColor: nc.bg }]}>
                <Ionicons name={getIcon(item.type) as any} size={22} color={nc.icon} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                  <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>
                    {item.title}
                  </Text>
                  {isUnread && <View style={[styles.unreadDot, { backgroundColor: nc.dot }]} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
