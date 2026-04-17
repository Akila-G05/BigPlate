import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useTheme } from '../../src/context/ThemeContext';
import { useCart } from '../../src/context/CartContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';
import { FoodImage } from '../../src/components/FoodImage';

type PromoItem = { menu_items: { id: string; name: string; image: string; price: number } };
type Promo = {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: number;
  type: string;
  combo_price: number;
  image: string;
  valid_until: string;
  min_order: number;
  is_active: boolean;
  promo_items: PromoItem[];
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: c.card },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  scrollContent: { padding: 20, paddingBottom: 100 },
  banner: { backgroundColor: APP_COLORS.primary, borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 8 },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  promoCard: { backgroundColor: c.card, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  promoImage: { width: '100%', height: 140 },
  promoContent: { padding: 16 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  discountBadge: { backgroundColor: APP_COLORS.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  promoDesc: { fontSize: 14, color: c.textSecondary, marginBottom: 12, lineHeight: 20 },
  promoFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  codeContainer: { borderWidth: 1, borderColor: APP_COLORS.primary, borderStyle: 'dashed', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  codeText: { fontSize: 14, fontWeight: '700', color: APP_COLORS.primary },
  applyButton: { flex: 1, backgroundColor: APP_COLORS.primary, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  applyText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  validText: { fontSize: 12, color: c.textSecondary },
  eligibleSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: c.border },
  eligibleTitle: { fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 8 },
  eligibleItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.input, borderRadius: 10, padding: 8, marginBottom: 6, gap: 10 },
  eligibleItemImage: { borderRadius: 8 },
  eligibleItemName: { fontSize: 13, fontWeight: '500', color: c.text, flex: 1 },
  eligibleItemPrice: { fontSize: 13, fontWeight: '700', color: APP_COLORS.primary },
  allItemsBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  allItemsText: { fontSize: 12, fontWeight: '600', color: '#065F46' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
});

export default function PromotionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const { showAlert } = useThemedAlert();
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const styles = createStyles(colors);

  const handlePromoAction = async (promo: Promo) => {
    if (promo.type === 'combo') {
      // Add all combo items to cart and go to checkout
      const items = promo.promo_items?.map((pi) => pi.menu_items).filter(Boolean) || [];
      if (items.length === 0) return;

      items.forEach((item) => addToCart(item));
      showAlert('Combo Added!', `${items.length} items added to your cart.`, [
        { text: 'OK', onPress: () => router.push('/checkout') },
      ]);
    } else {
      // For promo codes, go to menu or checkout
      router.push('/(tabs)/menu');
    }
  };

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const today = new Date().toISOString();
        const { data, error } = await supabase
          .from('promotions')
          .select('*, promo_items(menu_items(id, name, image, price))')
          .eq('is_active', true)
          .gte('valid_until', today)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPromos(data || []);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Ionicons name="gift" size={32} color="#FFF" />
          <Text style={styles.bannerTitle}>Exclusive Deals</Text>
          <Text style={styles.bannerSubtitle}>Save big on your favorite meals</Text>
        </View>

        {promos.map((promo) => {
          const eligibleItems = promo.promo_items?.map((pi) => pi.menu_items).filter(Boolean) || [];
          const appliesToAll = eligibleItems.length === 0;

          return (
            <View key={promo.id} style={styles.promoCard}>
              <FoodImage uri={promo.image} size={400} borderRadius={0} style={styles.promoImage} />
              <View style={styles.promoContent}>
                <View style={styles.promoHeader}>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  {promo.discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{promo.discount}% OFF</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.promoDesc}>{promo.description}</Text>

                <View style={styles.promoFooter}>
                  {promo.type !== 'free_delivery' && (
                    <View style={styles.codeContainer}>
                      <Text style={styles.codeText}>{promo.code}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.applyButton} onPress={() => handlePromoAction(promo)}>
                    <Text style={styles.applyText}>
                      {promo.type === 'combo' ? `Add Combo - Rs. ${promo.combo_price?.toLocaleString()}` : promo.type === 'free_delivery' ? 'Order Now' : 'Apply Code'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {promo.type === 'combo' && (
                  <View style={styles.allItemsBadge}>
                    <Text style={styles.allItemsText}>🍱 Combo Deal</Text>
                  </View>
                )}
                {promo.type === 'free_delivery' && (
                  <View style={styles.allItemsBadge}>
                    <Text style={styles.allItemsText}>🚚 Free Delivery</Text>
                  </View>
                )}

                {appliesToAll ? (
                  <View style={styles.allItemsBadge}>
                    <Text style={styles.allItemsText}>✓ Applies to all items</Text>
                  </View>
                ) : (
                  <View style={styles.eligibleSection}>
                    <Text style={styles.eligibleTitle}>Eligible Items:</Text>
                    {eligibleItems.map((item) => (
                      <View key={item.id} style={styles.eligibleItem}>
                        <FoodImage uri={item.image} size={40} borderRadius={8} style={styles.eligibleItemImage} />
                        <Text style={styles.eligibleItemName}>{item.name}</Text>
                        <Text style={styles.eligibleItemPrice}>Rs. {item.price.toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={styles.validText}>Valid until {new Date(promo.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • Min order: Rs. {promo.min_order.toLocaleString()}</Text>
              </View>
            </View>
          );
        })}

        {promos.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="gift-outline" size={64} color={colors.textSecondary} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginTop: 16 }}>No promotions available</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>Check back later for new deals!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
