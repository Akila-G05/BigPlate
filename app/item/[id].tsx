import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { APP_COLORS } from '../../src/constants';
import { useCart } from '../../src/context/CartContext';
import { FoodImage } from '../../src/components/FoodImage';

const ITEM_DETAILS: Record<string, { description: string; spice: string; prepTime: string; tags: string[] }> = {
  '1': { description: 'Our signature massive stacked burger with premium toppings, special sauce, and fresh ingredients. This is the ultimate burger experience.', spice: 'Mild', prepTime: '15-20 min', tags: ['Beef', 'Signature', 'Bestseller'] },
  '2': { description: 'Classic beef burger with our special Big Plate sauce, fresh lettuce, tomatoes, and melted cheese.', spice: 'Mild', prepTime: '10-15 min', tags: ['Beef', 'Classic'] },
  '3': { description: 'Loaded chicken submarine with fresh veggies, melted cheese, and our signature dressing in a fresh baked sub roll.', spice: 'Medium', prepTime: '10-15 min', tags: ['Chicken', 'New'] },
  '4': { description: 'Spicy Indo-Chinese devilled chicken with peppers, onions, and our secret spice blend. A customer favorite.', spice: 'Hot', prepTime: '15-20 min', tags: ['Chicken', 'Spicy', 'Chinese'] },
  '5': { description: 'Wok-fried rice with tender chicken pieces and fresh vegetables in our signature sauce.', spice: 'Mild', prepTime: '15 min', tags: ['Chicken', 'Rice'] },
  '6': { description: 'Aromatic basmati rice cooked with perfectly spiced chicken, saffron, and premium spices.', spice: 'Medium', prepTime: '20-25 min', tags: ['Chicken', 'Indian', 'Rice'] },
  '7': { description: 'Chopped roti stir-fried with tender chicken, fresh vegetables, and aromatic Sri Lankan spices.', spice: 'Medium', prepTime: '15-20 min', tags: ['Chicken', 'Sri Lankan'] },
  '8': { description: 'Fresh baked garlic naan bread from our tandoor oven. Perfect with any curry.', spice: 'Mild', prepTime: '5-10 min', tags: ['Bread', 'Indian'] },
  '9': { description: 'Spicy stir-fried beef with bell peppers, onions, and our signature chilli sauce.', spice: 'Hot', prepTime: '15-20 min', tags: ['Beef', 'Spicy', 'Chinese'] },
  '10': { description: 'Creamy yogurt mango smoothie made with real mango pulp and a hint of cardamom.', spice: 'None', prepTime: '5 min', tags: ['Drink', 'Sweet'] },
};

export default function ItemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const item = {
    id: params.id as string,
    name: params.name as string,
    description: params.description as string,
    price: Number(params.price),
    image: params.image as string,
    category_id: params.category_id as string,
    is_trending: params.is_trending === 'true',
  };

  const details = ITEM_DETAILS[item.id];
  const spiceColor = details?.spice === 'Hot' ? '#EF4444' : details?.spice === 'Medium' ? '#F59E0B' : '#10B981';

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <FoodImage uri={item.image} size={300} borderRadius={0} style={styles.itemDetailImage} />

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>

          {details && (
            <View style={styles.tagsRow}>
              <View style={[styles.spiceBadge, { backgroundColor: spiceColor + '20' }]}>
                <Text style={[styles.spiceText, { color: spiceColor }]}>{details.spice}</Text>
              </View>
              <View style={styles.tag}>
                <Ionicons name="time" size={14} color={APP_COLORS.textSecondary} />
                <Text style={styles.tagText}>{details.prepTime}</Text>
              </View>
            </View>
          )}

          <Text style={styles.itemPrice}>Rs. {item.price.toLocaleString()}</Text>

          {item.discount && (
            <View style={styles.discountRow}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}% OFF</Text>
              </View>
              <Text style={styles.originalPrice}>
                Rs. {Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}
              </Text>
            </View>
          )}

          {details && (
            <>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{details.description}</Text>

              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {details.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Ionicons name="remove" size={20} color={APP_COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={20} color={APP_COLORS.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>
            Add to Cart - Rs. {(item.price * quantity).toLocaleString()}
          </Text>
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
  scrollContent: { paddingBottom: 100 },
  itemDetailImage: {
    width: '100%',
    height: 280,
  },
  infoSection: { padding: 20 },
  itemName: { fontSize: 24, fontWeight: '800', color: APP_COLORS.text },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  spiceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  spiceText: { fontSize: 12, fontWeight: '600' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 12, color: APP_COLORS.textSecondary },
  itemPrice: { fontSize: 28, fontWeight: '800', color: APP_COLORS.primary, marginTop: 12 },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  discountBadge: { backgroundColor: APP_COLORS.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  originalPrice: { fontSize: 16, color: APP_COLORS.textSecondary, textDecorationLine: 'line-through' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: APP_COLORS.text, marginTop: 20, marginBottom: 8 },
  description: { fontSize: 15, color: APP_COLORS.textSecondary, lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagChipText: { fontSize: 13, color: APP_COLORS.textSecondary, fontWeight: '500' },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFF0F0', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  qtyButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text, minWidth: 24, textAlign: 'center' },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
