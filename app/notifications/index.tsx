import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Order Confirmed!',
    message: 'Your order #ORD-001 has been confirmed and is being prepared.',
    time: '2 min ago',
    read: false,
    type: 'order',
  },
  {
    id: '2',
    title: '20% OFF Burgers!',
    message: 'Get 20% off on all burgers this week. Use code BURGER20 at checkout.',
    time: '1 hour ago',
    read: false,
    type: 'promo',
  },
  {
    id: '3',
    title: 'Order Delivered',
    message: 'Your order #ORD-002 has been delivered. Enjoy your meal!',
    time: 'Yesterday',
    read: true,
    type: 'order',
  },
  {
    id: '4',
    title: 'New Menu Items!',
    message: 'Check out our new Chicken Submarine and Mango Lassi. Order now!',
    time: '2 days ago',
    read: true,
    type: 'promo',
  },
  {
    id: '5',
    title: 'Welcome to Big Plate!',
    message: 'Thanks for joining us. Enjoy exclusive deals and fast delivery.',
    time: '1 week ago',
    read: true,
    type: 'system',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'receipt';
      case 'promo':
        return 'gift';
      default:
        return 'information-circle';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return APP_COLORS.primary;
      case 'promo':
        return APP_COLORS.warning;
      default:
        return APP_COLORS.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={64} color={APP_COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notifCard, !item.read && styles.notifCardUnread]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={[styles.iconContainer, { backgroundColor: getIconColor(item.type) + '15' }]}>
              <Ionicons name={getIcon(item.type) as any} size={22} color={getIconColor(item.type)} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                  {item.title}
                </Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  markAllText: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '600' },
  list: { padding: 20, paddingBottom: 100 },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 12,
  },
  notifCardUnread: { borderColor: APP_COLORS.primary, backgroundColor: '#FFFBFB' },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: APP_COLORS.text },
  notifTitleUnread: { fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: APP_COLORS.primary },
  notifMessage: { fontSize: 13, color: APP_COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 12, color: APP_COLORS.textSecondary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8 },
});
