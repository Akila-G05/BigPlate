import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';

const MOCK_ORDERS = [
  {
    id: 'ORD-001',
    date: '2026-04-03',
    items: 'Tower Burger x1, Devilled Chicken x1',
    total: 4200,
    status: 'delivered',
  },
];

export default function OrdersScreen() {
  if (MOCK_ORDERS.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>📋</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(order) => order.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{item.id}</Text>
              <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.orderItems}>{item.items}</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.orderDate}>{item.date}</Text>
              <Text style={styles.orderTotal}>Rs. {item.total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.reorderButton}>
              <Ionicons name="refresh" size={16} color={APP_COLORS.primary} />
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, paddingTop: 50 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: APP_COLORS.text },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, fontWeight: '700', color: APP_COLORS.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  status_delivered: { backgroundColor: '#D1FAE5' },
  status_pending: { backgroundColor: '#FEF3C7' },
  status_preparing: { backgroundColor: '#DBEAFE' },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: APP_COLORS.text },
  orderItems: { fontSize: 14, color: APP_COLORS.textSecondary, marginBottom: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  orderDate: { fontSize: 13, color: APP_COLORS.textSecondary },
  orderTotal: { fontSize: 16, fontWeight: '700', color: APP_COLORS.primary },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
  },
  reorderText: { fontSize: 14, fontWeight: '600', color: APP_COLORS.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
});
