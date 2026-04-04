import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';

type Branch = { id: string; name: string; address: string; phone: string; delivers_to_city: boolean };

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: c.card },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  scrollContent: { padding: 20, paddingBottom: 100 },
  cityInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: c.border, gap: 10 },
  cityInfoText: { flex: 1, fontSize: 14, color: c.textSecondary },
  cityInfoName: { fontWeight: '700', color: c.text },
  deliveryInfoText: { fontSize: 13, color: c.textSecondary },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 12 },
  branchCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: c.border, gap: 12 },
  branchCardActive: { borderColor: APP_COLORS.primary, backgroundColor: 'rgba(230, 57, 70, 0.1)' },
  branchCardDisabled: { opacity: 0.5, backgroundColor: c.input },
  branchInfo: { flex: 1 },
  branchName: { fontSize: 15, fontWeight: '600', color: c.text },
  branchNameDisabled: { color: c.textSecondary },
  branchAddress: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
  noDeliveryText: { fontSize: 12, color: '#EF4444', marginTop: 4, fontWeight: '500' },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 6 },
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: c.text },
  disabledInput: { backgroundColor: c.input, color: c.textSecondary },
  textArea: { textAlignVertical: 'top', minHeight: 80 },
  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: c.border, gap: 12 },
  paymentOptionActive: { borderColor: APP_COLORS.primary, backgroundColor: 'rgba(230, 57, 70, 0.15)' },
  paymentInfo: { flex: 1 },
  paymentName: { fontSize: 15, fontWeight: '600', color: c.text },
  paymentDesc: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border },
  summaryItemName: { fontSize: 14, color: c.text },
  summaryItemPrice: { fontSize: 14, fontWeight: '600', color: c.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  summaryLabel: { fontSize: 14, color: c.textSecondary },
  summaryValue: { fontSize: 14, color: c.text },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12, marginTop: 4 },
  grandTotalLabel: { fontSize: 18, fontWeight: '700', color: c.text },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: APP_COLORS.primary },
  bottomBar: { padding: 20, paddingBottom: 32, backgroundColor: c.card, borderTopWidth: 1, borderTopColor: c.border },
  placeOrderButton: { backgroundColor: APP_COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginTop: 16 },
});

export default function CheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, clearCart } = useCart();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [deliveryTime, setDeliveryTime] = useState(30);
  const [deliveryFee, setDeliveryFee] = useState(250);
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const styles = createStyles(colors);

  useEffect(() => {
    if (!user) {
      showAlert('Sign in required', 'Please sign in to place an order', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
      return;
    }

    const fetchData = async () => {
      try {
        // Get user's default address
        const { data: addresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .limit(1);

        if (!addresses || addresses.length === 0) {
          showAlert('No address', 'Please add a delivery address first', [
            { text: 'OK', onPress: () => router.replace('/address') },
          ]);
          setDataLoading(false);
          return;
        }

        const userAddress = addresses[0];
        setUserCity(userAddress.city);
        setDeliveryAddress(userAddress.line1 + (userAddress.line2 ? ', ' + userAddress.line2 : '') + ', ' + userAddress.city);

        // Get city delivery info
        const { data: cityData } = await supabase
          .from('cities')
          .select('id, delivery_time_minutes, delivery_fee')
          .eq('name', userAddress.city)
          .single();

        if (cityData) {
          setDeliveryTime(cityData.delivery_time_minutes);
          setDeliveryFee(cityData.delivery_fee);

          // Fetch branches and their delivery zones
          const { data: branchesData } = await supabase
            .from('branches')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true });

          const { data: zonesData } = await supabase
            .from('branch_delivery_zones')
            .select('branch_id')
            .eq('city_id', cityData.id);

          const deliveringBranchIds = new Set(zonesData?.map((z) => z.branch_id) || []);

          const branchesWithStatus = branchesData?.map((b) => ({
            id: b.id,
            name: b.name,
            address: b.address,
            phone: b.phone,
            delivers_to_city: deliveringBranchIds.has(b.id),
          })) || [];

          setBranches(branchesWithStatus);

          // Auto-select first available branch
          const available = branchesWithStatus.find((b) => b.delivers_to_city);
          if (available) setSelectedBranch(available.id);
        }
      } catch (error) {
        console.error('Failed to fetch checkout data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
        </View>
      </View>
    );
  }

  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedBranch) {
      showAlert('Error', 'No branch delivers to your area');
      return;
    }
    if (!phone.trim()) {
      showAlert('Error', 'Please enter your phone number');
      return;
    }
    if (!user) {
      showAlert('Error', 'Please sign in to place an order');
      router.replace('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .limit(1);

      if (!addresses || addresses.length === 0) {
        showAlert('Error', 'No delivery address found');
        setLoading(false);
        return;
      }

      const userAddress = addresses[0];
      const fullAddress = userAddress.line1 + (userAddress.line2 ? ', ' + userAddress.line2 : '') + ', ' + userAddress.city;
      const branch = branches.find((b) => b.id === selectedBranch);
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          branch: branch?.name || '',
          city: userCity,
          total: grandTotal,
          delivery_fee: deliveryFee,
          payment_method: paymentMethod,
          delivery_name: userAddress.label,
          delivery_phone: phone,
          delivery_address: fullAddress,
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
      showAlert('Order Failed', error.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {userCity && (
          <View style={styles.cityInfo}>
            <Ionicons name="location" size={20} color={APP_COLORS.primary} />
            <Text style={styles.cityInfoText}>Delivering to <Text style={styles.cityInfoName}>{userCity}</Text></Text>
            <Text style={styles.deliveryInfoText}>{deliveryTime} min • Rs. {deliveryFee} delivery fee</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Branch</Text>
          {branches.map((b) => {
            const isDisabled = !b.delivers_to_city;
            const isSelected = selectedBranch === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.branchCard,
                  isSelected && styles.branchCardActive,
                  isDisabled && styles.branchCardDisabled,
                ]}
                onPress={() => !isDisabled && setSelectedBranch(b.id)}
                disabled={isDisabled}
              >
                <Ionicons
                  name={isDisabled ? 'ban' : isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={isDisabled ? colors.textSecondary : APP_COLORS.primary}
                />
                <View style={styles.branchInfo}>
                  <Text style={[styles.branchName, isDisabled && styles.branchNameDisabled]}>{b.name}</Text>
                  <Text style={styles.branchAddress}>{b.address}</Text>
                  {isDisabled && (
                    <Text style={styles.noDeliveryText}>No delivery to {userCity}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={deliveryAddress}
              editable={false}
              multiline
              numberOfLines={2}
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
              placeholderTextColor={colors.textSecondary}
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
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.menu_item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName}>
                {item.menu_item.name} x{item.quantity}
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
            <Text style={styles.summaryValue}>Rs. {deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>Rs. {grandTotal.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={loading || !selectedBranch}>
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
