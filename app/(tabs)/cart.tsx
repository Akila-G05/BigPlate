import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useCart } from '../../src/context/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items from the menu to get started</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={styles.browseText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.menu_item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemImage}>
              <Text style={{ fontSize: 32 }}>{item.menu_item.image}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.menu_item.name}</Text>
              <Text style={styles.itemPrice}>Rs. {(item.menu_item.price * item.quantity).toLocaleString()}</Text>
            </View>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => updateQuantity(item.menu_item.id, item.quantity - 1)}
              >
                <Ionicons name={item.quantity === 1 ? 'trash' : 'remove'} size={18} color={APP_COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => updateQuantity(item.menu_item.id, item.quantity + 1)}
              >
                <Ionicons name="add" size={18} color={APP_COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Checkout */}
      <View style={styles.checkout}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: APP_COLORS.text },
  clearText: { color: APP_COLORS.primary, fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 200 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  itemImage: {
    width: 56,
    height: 56,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: '600', color: APP_COLORS.text },
  itemPrice: { fontSize: 14, fontWeight: '700', color: APP_COLORS.primary, marginTop: 4 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: 16, fontWeight: '600', color: APP_COLORS.text, minWidth: 20, textAlign: 'center' },
  checkout: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
    padding: 20,
    paddingBottom: 40,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  totalLabel: { fontSize: 16, color: APP_COLORS.textSecondary },
  totalValue: { fontSize: 22, fontWeight: '800', color: APP_COLORS.text },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  checkoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  browseButton: {
    backgroundColor: APP_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
  },
  browseText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
