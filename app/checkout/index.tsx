import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS, BRANCHES } from '../../src/constants';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const [branch, setBranch] = useState(BRANCHES[0].id);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={APP_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
        </View>
      </View>
    );
  }

  const deliveryFee = 250;
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Please sign in to place an order');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          branch: BRANCHES.find((b) => b.id === branch)?.name || branch,
          total: grandTotal,
          delivery_fee: deliveryFee,
          payment_method: paymentMethod,
          delivery_name: name,
          delivery_phone: phone,
          delivery_address: address,
          delivery_instructions: instructions || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => {
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.menu_item.id);
        return {
          order_id: order.id,
          menu_item_id: isValidUuid ? item.menu_item.id : null,
          name: item.menu_item.name,
          quantity: item.quantity,
          price: item.menu_item.price,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      router.replace('/checkout/confirmation');
    } catch (error: any) {
      Alert.alert('Order Failed', error.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Branch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Branch</Text>
          {BRANCHES.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.branchCard, branch === b.id && styles.branchCardActive]}
              onPress={() => setBranch(b.id)}
            >
              <Ionicons
                name={branch === b.id ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={APP_COLORS.primary}
              />
              <View style={styles.branchInfo}>
                <Text style={styles.branchName}>{b.name}</Text>
                <Text style={styles.branchAddress}>{b.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={APP_COLORS.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+94 7X XXX XXXX"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={APP_COLORS.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your full address"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              placeholderTextColor={APP_COLORS.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Ring the bell, 3rd floor"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={2}
              placeholderTextColor={APP_COLORS.textSecondary}
            />
          </View>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Ionicons name="cash" size={24} color={APP_COLORS.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Cash on Delivery</Text>
              <Text style={styles.paymentDesc}>Pay when you receive</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={APP_COLORS.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card" size={24} color={APP_COLORS.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Card Payment</Text>
              <Text style={styles.paymentDesc}>Pay at the branch</Text>
            </View>
            <Ionicons
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={APP_COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.menu_item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName}>
                {item.menu_item.image} {item.menu_item.name} x{item.quantity}
              </Text>
              <Text style={styles.summaryItemPrice}>
                Rs. {(item.menu_item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {total.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>Rs. {deliveryFee}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>Rs. {grandTotal.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order - Rs. {grandTotal.toLocaleString()}</Text>
          )}
        </TouchableOpacity>
      </View>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text, marginBottom: 12 },
  branchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 12,
  },
  branchCardActive: { borderColor: APP_COLORS.primary, backgroundColor: '#FFF5F5' },
  branchInfo: { flex: 1 },
  branchName: { fontSize: 15, fontWeight: '600', color: APP_COLORS.text },
  branchAddress: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 2 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: APP_COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: APP_COLORS.text,
  },
  textArea: { textAlignVertical: 'top', minHeight: 80 },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 12,
  },
  paymentOptionActive: { borderColor: APP_COLORS.primary, backgroundColor: '#FFF5F5' },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: 15, fontWeight: '600', color: APP_COLORS.text },
  paymentDesc: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 2 },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  summaryItemName: { fontSize: 14, color: APP_COLORS.text },
  summaryItemPrice: { fontSize: 14, fontWeight: '600', color: APP_COLORS.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: APP_COLORS.textSecondary },
  summaryValue: { fontSize: 14, color: APP_COLORS.text },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: APP_COLORS.border, paddingTop: 12, marginTop: 4 },
  grandTotalLabel: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: APP_COLORS.primary },
  bottomBar: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
  },
  placeOrderButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
});
