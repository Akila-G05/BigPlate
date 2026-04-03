import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';

const PROMOTIONS = [
  {
    id: '1',
    title: '20% OFF Burgers',
    description: 'Get 20% off on all burgers this week. Use code BURGER20 at checkout.',
    code: 'BURGER20',
    discount: 20,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=300&fit=crop',
    validUntil: 'Apr 10, 2026',
    minOrder: 1000,
  },
  {
    id: '2',
    title: 'Free Delivery',
    description: 'Free delivery on orders above Rs. 2000. No code needed!',
    code: 'FREEDEL',
    discount: 0,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=300&fit=crop',
    validUntil: 'Apr 15, 2026',
    minOrder: 2000,
  },
  {
    id: '3',
    title: 'Combo Deal - Rs. 1500',
    description: 'Burger + Fries + Drink combo at just Rs. 1500. Save Rs. 500!',
    code: 'COMBO1500',
    discount: 25,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=300&fit=crop',
    validUntil: 'Apr 20, 2026',
    minOrder: 1500,
  },
];

export default function PromotionsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Ionicons name="gift" size={32} color="#FFF" />
          <Text style={styles.bannerTitle}>Exclusive Deals</Text>
          <Text style={styles.bannerSubtitle}>Save big on your favorite meals</Text>
        </View>

        {PROMOTIONS.map((promo) => (
          <View key={promo.id} style={styles.promoCard}>
            <Image source={{ uri: promo.image }} style={styles.promoImage} />
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
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{promo.code}</Text>
                </View>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => router.push('/(tabs)/menu')}
                >
                  <Text style={styles.applyText}>Order Now</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.validText}>Valid until {promo.validUntil}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  banner: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 8 },
  bannerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  promoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    overflow: 'hidden',
  },
  promoImage: { width: '100%', height: 140 },
  promoContent: { padding: 16 },
  promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  discountBadge: { backgroundColor: APP_COLORS.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  promoDesc: { fontSize: 14, color: APP_COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
  promoFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  codeContainer: {
    borderWidth: 1,
    borderColor: APP_COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codeText: { fontSize: 14, fontWeight: '700', color: APP_COLORS.primary },
  applyButton: {
    flex: 1,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  applyText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  validText: { fontSize: 12, color: APP_COLORS.textSecondary },
});
