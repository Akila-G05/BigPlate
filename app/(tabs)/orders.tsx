import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';

const ORDER_STATUSES = [
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'flame' },
  { key: 'delivering', label: 'On the Way', icon: 'bicycle' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
];

const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    date: '2026-04-03',
    time: '7:30 PM',
    items: [
      { name: 'Tower Burger', qty: 1, price: 3100 },
      { name: 'Devilled Chicken', qty: 1, price: 1100 },
    ],
    total: 4200,
    status: 'preparing',
    branch: 'Colombo 03',
    estimatedTime: '25 min',
  },
  {
    id: 'ORD-002',
    date: '2026-04-02',
    time: '1:15 PM',
    items: [
      { name: 'Chicken Biryani', qty: 2, price: 2100 },
      { name: 'Garlic Naan', qty: 3, price: 1050 },
      { name: 'Mango Lassi', qty: 2, price: 900 },
    ],
    total: 4050,
    status: 'delivered',
    branch: 'Rajagiriya',
    estimatedTime: '30 min',
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState(MOCK_ORDERS[0]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const activeOrders = MOCK_ORDERS.filter((o) => o.status !== 'delivered');
  const pastOrders = MOCK_ORDERS.filter((o) => o.status === 'delivered');

  if (MOCK_ORDERS.length === 0) {
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
        {/* Active Order Tracking */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Order</Text>
            <TouchableOpacity
              style={styles.activeOrderCard}
              onPress={() =>
                setSelectedOrder(selectedOrder === activeOrder.id ? null : activeOrder.id)
              }
            >
              <View style={styles.activeOrderHeader}>
                <View>
                  <Text style={styles.activeOrderId}>{activeOrder.id}</Text>
                  <Text style={styles.activeOrderBranch}>{activeOrder.branch}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              {/* Progress Steps */}
              <View style={styles.progressSteps}>
                {ORDER_STATUSES.map((step, index) => {
                  const currentIndex = ORDER_STATUSES.findIndex((s) => s.key === activeOrder.status);
                  const isActive = index <= currentIndex;
                  const isCurrent = index === currentIndex;

                  return (
                    <View key={step.key} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          isActive && styles.stepDotActive,
                          isCurrent && styles.stepDotCurrent,
                        ]}
                      >
                        <Ionicons
                          name={step.icon as any}
                          size={16}
                          color={isActive ? '#FFF' : APP_COLORS.textSecondary}
                        />
                      </View>
                      <Text
                        style={[
                          styles.stepLabel,
                          isActive && styles.stepLabelActive,
                        ]}
                      >
                        {step.label}
                      </Text>
                      {index < ORDER_STATUSES.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            index < currentIndex && styles.stepLineActive,
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.activeOrderFooter}>
                <View>
                  <Text style={styles.etaLabel}>Estimated Delivery</Text>
                  <Text style={styles.etaValue}>{activeOrder.estimatedTime}</Text>
                </View>
                <Ionicons
                  name={selectedOrder === activeOrder.id ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color={APP_COLORS.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {/* Expanded Order Details */}
            {selectedOrder === activeOrder.id && (
              <View style={styles.orderDetails}>
                {activeOrder.items.map((item, index) => (
                  <View key={index} style={styles.detailItem}>
                    <Text style={styles.detailItemName}>
                      {item.name} x{item.qty}
                    </Text>
                    <Text style={styles.detailItemPrice}>
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </Text>
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

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Orders</Text>
            {pastOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date} at {order.time}</Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status_${order.status}`]]}>
                    <Text style={styles.statusText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderItems}>
                  {order.items.map((i) => `${i.name} x${i.qty}`).join(', ')}
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
