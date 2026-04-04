import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';

const ORDER_STATUSES = [
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'flame' },
  { key: 'delivering', label: 'On the Way', icon: 'bicycle' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
];

type OrderItem = { id: string; order_id: string; menu_item_id: string; name: string; quantity: number; price: number };
type Order = { id: string; user_id: string; branch: string; status: string; total: number; delivery_fee: number; payment_method: string; delivery_name: string; delivery_phone: string; delivery_address: string; delivery_instructions: string; created_at: string; order_items: OrderItem[] };

export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().then(() => setRefreshing(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const pastOrders = orders.filter((o) => o.status === 'delivered');
  const activeOrder = activeOrders[0];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color={APP_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.browseText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={APP_COLORS.primary} />
        </View>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={64} color={APP_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.browseText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[APP_COLORS.primary]} tintColor={APP_COLORS.primary} />}>
        {activeOrders.length > 0 && activeOrder && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Order</Text>
            <TouchableOpacity
              style={styles.activeOrderCard}
              onPress={() => setSelectedOrder(selectedOrder === activeOrder.id ? null : activeOrder.id)}
            >
              <View style={styles.activeOrderHeader}>
                <View>
                  <Text style={styles.activeOrderId}>#{activeOrder.id.slice(0, 8)}</Text>
                  <Text style={styles.activeOrderBranch}>{activeOrder.branch}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <View style={styles.progressSteps}>
                {ORDER_STATUSES.map((step, index) => {
                  const statusKeys = ORDER_STATUSES.map((s) => s.key);
                  const currentIndex = statusKeys.indexOf(activeOrder.status);
                  const isActive = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <View key={step.key} style={styles.stepItem}>
                      <View style={[styles.stepDot, isActive && styles.stepDotActive, isCurrent && styles.stepDotCurrent]}>
                        <Ionicons name={step.icon as any} size={16} color={isActive ? '#FFF' : APP_COLORS.textSecondary} />
                      </View>
                      <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step.label}</Text>
                      {index < ORDER_STATUSES.length - 1 && (
                        <View style={[styles.stepLine, index < currentIndex && styles.stepLineActive]} />
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.activeOrderFooter}>
                <View>
                  <Text style={styles.etaLabel}>Estimated Delivery</Text>
                  <Text style={styles.etaValue}>25-35 min</Text>
                </View>
                <Ionicons name={selectedOrder === activeOrder.id ? 'chevron-up' : 'chevron-down'} size={24} color={APP_COLORS.textSecondary} />
              </View>
            </TouchableOpacity>

            {selectedOrder === activeOrder.id && (
              <View style={styles.orderDetails}>
                {activeOrder.order_items?.map((item) => (
                  <View key={item.id} style={styles.detailItem}>
                    <Text style={styles.detailItemName}>{item.name} x{item.quantity}</Text>
                    <Text style={styles.detailItemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</Text>
                  </View>
                ))}
                <View style={styles.detailTotal}>
                  <Text style={styles.detailTotalLabel}>Total</Text>
                  <Text style={styles.detailTotalValue}>Rs. {activeOrder.total.toLocaleString()}</Text>
                </View>
                <TouchableOpacity style={styles.callButton}>
                  <Ionicons name="call" size={18} color="#FFF" />
                  <Text style={styles.callButtonText}>Call Restaurant</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {pastOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Orders</Text>
            {pastOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>#{order.id.slice(0, 8)}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderItems}>
                  {order.order_items?.map((i) => `${i.name} x${i.quantity}`).join(', ')}
                </Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>Rs. {order.total.toLocaleString()}</Text>
                  <TouchableOpacity style={styles.reorderButton}>
                    <Ionicons name="refresh" size={16} color={APP_COLORS.primary} />
                    <Text style={styles.reorderText}>Reorder</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, paddingTop: 50 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: APP_COLORS.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text, marginBottom: 12 },
  activeOrderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: APP_COLORS.primary,
  },
  activeOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  activeOrderId: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  activeOrderBranch: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: APP_COLORS.primary },
  liveText: { fontSize: 11, fontWeight: '700', color: APP_COLORS.primary },
  progressSteps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepDotActive: { backgroundColor: APP_COLORS.success },
  stepDotCurrent: { backgroundColor: APP_COLORS.primary },
  stepLabel: { fontSize: 10, color: APP_COLORS.textSecondary, textAlign: 'center' },
  stepLabelActive: { color: APP_COLORS.success, fontWeight: '600' },
  stepLine: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: '100%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  stepLineActive: { backgroundColor: APP_COLORS.success },
  activeOrderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  etaLabel: { fontSize: 12, color: APP_COLORS.textSecondary },
  etaValue: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  orderDetails: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  detailItemName: { fontSize: 14, color: APP_COLORS.text },
  detailItemPrice: { fontSize: 14, fontWeight: '600', color: APP_COLORS.text },
  detailTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  detailTotalLabel: { fontSize: 16, fontWeight: '600', color: APP_COLORS.text },
  detailTotalValue: { fontSize: 18, fontWeight: '800', color: APP_COLORS.primary },
  callButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.success,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  callButtonText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: APP_COLORS.text },
  orderDate: { fontSize: 12, color: APP_COLORS.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  status_delivered: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: APP_COLORS.text },
  orderItems: { fontSize: 13, color: APP_COLORS.textSecondary, marginBottom: 10 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 16, fontWeight: '700', color: APP_COLORS.primary },
  reorderButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reorderText: { fontSize: 13, fontWeight: '600', color: APP_COLORS.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  browseButton: { backgroundColor: APP_COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  browseText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
