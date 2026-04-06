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
import { validatePhone } from '../../src/utils/validation';

type Branch = { id: string; name: string; address: string; phone: string; delivers_to_city: boolean };
type Promo = { id: string; code: string; discount: number; min_order: number; title: string; eligibleItemIds: string[]; type: string; combo_price: number; freeDelivery: boolean };

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
  promoRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  promoInput: { flex: 1, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: c.text },
  promoButton: { backgroundColor: APP_COLORS.primary, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  promoButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  promoApplied: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', borderRadius: 12, padding: 12, marginBottom: 8, gap: 8 },
  promoAppliedText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#065F46' },
  promoRemove: { padding: 4 },
  promoError: { fontSize: 13, color: '#EF4444', marginTop: 4 },
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
  discountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  discountLabel: { fontSize: 14, color: APP_COLORS.success, fontWeight: '600' },
  discountValue: { fontSize: 14, color: APP_COLORS.success, fontWeight: '700' },
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
  const [originalDeliveryFee, setOriginalDeliveryFee] = useState(250);
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);

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
        // Fetch user profile for phone number
        const { data: userProfile } = await supabase
          .from('users')
          .select('phone')
          .eq('id', user.id)
          .single();

        if (userProfile?.phone) {
          setPhone(userProfile.phone);
        }

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

        const { data: cityData } = await supabase
          .from('cities')
          .select('id, delivery_time_minutes, delivery_fee')
          .eq('name', userAddress.city)
          .single();

        if (cityData) {
          setDeliveryTime(cityData.delivery_time_minutes);
          setDeliveryFee(cityData.delivery_fee);
          setOriginalDeliveryFee(cityData.delivery_fee);

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

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Enter a promo code');
      return;
    }

    setPromoLoading(true);
    setPromoError('');

    try {
      const { data: promo, error } = await supabase
        .from('promotions')
        .select('*, promo_items(menu_item_id)')
        .eq('code', promoCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        setPromoError('Invalid promo code');
        setPromoLoading(false);
        return;
      }

      // Check minimum order
      if (total < promo.min_order) {
        setPromoError(`Minimum order is Rs. ${promo.min_order.toLocaleString()}`);
        setPromoLoading(false);
        return;
      }

      const eligibleItemIds = promo.promo_items?.map((pi: any) => pi.menu_item_id) || [];
      let discountAmount = 0;
      let freeDelivery = false;
      const promoType = promo.type || 'item_discount'; // Fallback if type is missing

      console.log('Promo Type:', promoType, 'Eligible Items:', eligibleItemIds);

      if (promoType === 'free_delivery') {
        freeDelivery = true;
        setDeliveryFee(0);
        discountAmount = 0;
      } else if (promoType === 'item_discount') {
        // Reset delivery fee if it was previously free
        setDeliveryFee(originalDeliveryFee);

        // Only discount eligible items
        if (eligibleItemIds.length > 0) {
          const cartItemIds = items.map((i) => i.menu_item.id);
          console.log('Cart Item IDs:', cartItemIds);
          const hasEligibleItem = cartItemIds.some((id) => eligibleItemIds.includes(id));
          
          if (!hasEligibleItem) {
            setPromoError('This promo code doesn\'t apply to items in your cart');
            setPromoLoading(false);
            return;
          }
          items.forEach((item) => {
            if (eligibleItemIds.includes(item.menu_item.id)) {
              discountAmount += item.menu_item.price * item.quantity * (promo.discount / 100);
            }
          });
          console.log('Discount Amount:', discountAmount);
        } else {
          // Discount applies to entire order
          discountAmount = total * (promo.discount / 100);
        }
      } else if (promoType === 'combo') {
        // Reset delivery fee if it was previously free
        setDeliveryFee(originalDeliveryFee);

        if (!promo.combo_price) {
          setPromoError('Invalid combo configuration.');
          setPromoLoading(false);
          return;
        }

        // Check if cart contains ALL required items
        const cartItemIds = items.map((i) => i.menu_item.id);
        const missingItems = eligibleItemIds.filter(id => !cartItemIds.includes(id));

        if (missingItems.length > 0) {
          setPromoError('Please add all required combo items to your cart.');
          setPromoLoading(false);
          return;
        }

        // Calculate sum of required items in cart
        let requiredItemsTotal = 0;
        items.forEach(item => {
          if (eligibleItemIds.includes(item.menu_item.id)) {
            requiredItemsTotal += item.menu_item.price * item.quantity;
          }
        });

        // Discount is the difference between individual prices and combo price
        const discount = requiredItemsTotal - promo.combo_price;
        
        if (discount > 0) {
          discountAmount = discount;
        } else {
          setPromoError('Cart total for combo items is less than combo price.');
          setPromoLoading(false);
          return;
        }
      }

      setAppliedPromo({
        id: promo.id,
        code: promo.code,
        discount: promo.discount,
        min_order: promo.min_order,
        title: promo.title,
        eligibleItemIds,
        type: promo.type,
        combo_price: promo.combo_price,
        freeDelivery,
      });
      setDiscount(Math.round(discountAmount));
      setPromoCode('');
    } catch (error) {
      setPromoError('Failed to apply promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setDiscount(0);
    setDeliveryFee(originalDeliveryFee);
    setPromoError('');
    setPromoCode('');
  };

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

  const subtotal = total - discount;
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedBranch) {
      showAlert('Error', 'No branch delivers to your area');
      return;
    }
    if (!validatePhone(phone)) {
      showAlert('Error', 'Please enter a valid phone number (e.g., 0771234567 or +94771234567)');
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

      const { data: statusData } = await supabase
        .from('order_statuses')
        .select('id')
        .eq('name', 'pending')
        .single();

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
          status_id: statusData?.id,
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

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Create in-app notification (for the bell icon)
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Order Placed! 🎉',
        message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
        type: 'order',
      });

      // Send Push/Email Notification directly from the app
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('email, expo_push_token, push_notifications, email_notifications')
          .eq('id', user.id)
          .single();

        if (userData && (userData.push_notifications || userData.email_notifications)) {
          await supabase.functions.invoke('bright-service', {
            body: {
              pushToken: userData.expo_push_token,
              userEmail: userData.email,
              sendPush: userData.push_notifications,
              sendEmail: userData.email_notifications,
              title: 'Order Placed! 🎉',
              body: `Your order #${order.id.slice(0, 8)} has been placed successfully.`,
              data: { type: 'order', orderId: order.id },
            },
          });
        }
      } catch (notifError) {
        console.error('Failed to send push/email notification:', notifError);
        // Don't stop the order if notification fails
      }

      clearCart();
      router.replace({ pathname: '/checkout/confirmation', params: { orderId: order.id } });
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
                style={[styles.branchCard, isSelected && styles.branchCardActive, isDisabled && styles.branchCardDisabled]}
                onPress={() => !isDisabled && setSelectedBranch(b.id)}
                disabled={isDisabled}
              >
                <Ionicons name={isDisabled ? 'ban' : isSelected ? 'radio-button-on' : 'radio-button-off'} size={22} color={isDisabled ? colors.textSecondary : APP_COLORS.primary} />
                <View style={styles.branchInfo}>
                  <Text style={[styles.branchName, isDisabled && styles.branchNameDisabled]}>{b.name}</Text>
                  <Text style={styles.branchAddress}>{b.address}</Text>
                  {isDisabled && <Text style={styles.noDeliveryText}>No delivery to {userCity}</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address</Text>
            <TextInput style={[styles.input, styles.disabledInput]} value={deliveryAddress} editable={false} multiline numberOfLines={2} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="+94 7X XXX XXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textSecondary} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Instructions (Optional)</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="e.g., Ring the bell, 3rd floor" value={instructions} onChangeText={setInstructions} multiline numberOfLines={2} placeholderTextColor={colors.textSecondary} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          {appliedPromo ? (
            <View style={styles.promoApplied}>
              <Ionicons name="checkmark-circle" size={20} color="#065F46" />
              <Text style={styles.promoAppliedText}>{appliedPromo.code} ({appliedPromo.discount}% OFF)</Text>
              <TouchableOpacity style={styles.promoRemove} onPress={removePromo}>
                <Ionicons name="close-circle" size={22} color="#065F46" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.promoRow}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChangeText={(t) => { setPromoCode(t); setPromoError(''); }}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.promoButton} onPress={applyPromo} disabled={promoLoading}>
                  {promoLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.promoButtonText}>Apply</Text>}
                </TouchableOpacity>
              </View>
              {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('cash')}>
            <Ionicons name="cash" size={24} color={APP_COLORS.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Cash on Delivery</Text>
              <Text style={styles.paymentDesc}>Pay when you receive</Text>
            </View>
            <Ionicons name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} size={22} color={APP_COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('card')}>
            <Ionicons name="card" size={24} color={APP_COLORS.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Card Payment</Text>
              <Text style={styles.paymentDesc}>Pay at the branch</Text>
            </View>
            <Ionicons name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'} size={22} color={APP_COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.menu_item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName}>{item.menu_item.name} x{item.quantity}</Text>
              <Text style={styles.summaryItemPrice}>Rs. {(item.menu_item.price * item.quantity).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {total.toLocaleString()}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Discount ({appliedPromo?.code})</Text>
              <Text style={styles.discountValue}>- Rs. {discount.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, appliedPromo?.freeDelivery && { textDecorationLine: 'line-through', color: colors.textSecondary }]}>
              Rs. {originalDeliveryFee.toLocaleString()}
            </Text>
          </View>
          {appliedPromo?.freeDelivery && (
            <View style={styles.discountRow}>
              <Text style={styles.discountLabel}>Free Delivery</Text>
              <Text style={styles.discountValue}>- Rs. {originalDeliveryFee.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>Rs. {grandTotal.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder} disabled={loading || !selectedBranch}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.placeOrderText}>Place Order - Rs. {grandTotal.toLocaleString()}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
