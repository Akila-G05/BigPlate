import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';
import { FoodImage } from '../../src/components/FoodImage';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  is_trending: boolean;
  is_new: boolean;
  discount: number;
  spice_level: string;
  prep_time: string;
  tags: string[];
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name: string | null;
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: c.card,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  favButton: { padding: 4 },
  scrollContent: { paddingBottom: 100 },
  itemDetailImage: {
    width: '100%',
    height: 280,
  },
  infoSection: { padding: 20 },
  itemName: { fontSize: 24, fontWeight: '800', color: c.text },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  spiceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  spiceText: { fontSize: 12, fontWeight: '600' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 12, color: c.textSecondary },
  itemPrice: { fontSize: 28, fontWeight: '800', color: APP_COLORS.primary, marginTop: 12 },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  discountBadge: { backgroundColor: APP_COLORS.warning, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  originalPrice: { fontSize: 16, color: c.textSecondary, textDecorationLine: 'line-through' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: c.text, marginTop: 20, marginBottom: 8 },
  description: { fontSize: 15, color: c.textSecondary, lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { backgroundColor: c.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagChipText: { fontSize: 13, color: c.textSecondary, fontWeight: '500' },
  newBadgeInline: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: APP_COLORS.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', marginTop: 16 },
  newTextInline: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  reviewsSection: { marginTop: 24 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  avgRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avgRatingValue: { fontSize: 20, fontWeight: '800', color: c.text },
  avgRatingCount: { fontSize: 13, color: c.textSecondary },
  reviewCard: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: c.border },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: c.text },
  reviewDate: { fontSize: 12, color: c.textSecondary },
  reviewStars: { flexDirection: 'row', gap: 2, marginBottom: 6 },
  reviewComment: { fontSize: 14, color: c.text, lineHeight: 20 },
  noReviews: { alignItems: 'center', paddingVertical: 24 },
  noReviewsText: { fontSize: 14, color: c.textSecondary, marginTop: 8 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.border,
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: 'rgba(230, 57, 70, 0.1)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  qtyButton: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: 18, fontWeight: '700', color: c.text, minWidth: 24, textAlign: 'center' },
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

export default function ItemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const styles = createStyles(colors);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setItem(data);
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params.id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!params.id) return;
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('id, rating, comment, created_at, user_name')
          .eq('menu_item_id', params.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setReviews(data || []);

        if (data && data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchReviews();
  }, [params.id]);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !item) return;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('menu_item_id', item.id)
        .maybeSingle();
      setIsFavorite(!!data);
    };
    checkFavorite();
  }, [user, item]);

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!item) return;

    if (isFavorite) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('menu_item_id', item.id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, menu_item_id: item.id });
      setIsFavorite(true);
    }
  };

  const handleAddToCart = () => {
    if (!item) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  }

  const spiceColor = item.spice_level === 'Hot' ? '#EF4444' : item.spice_level === 'Medium' ? '#F59E0B' : '#10B981';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Item Details</Text>
        <TouchableOpacity style={styles.favButton} onPress={toggleFavorite}>
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={24} color={isFavorite ? APP_COLORS.primary : colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: item.image }} style={styles.itemDetailImage} />

        <View style={styles.infoSection}>
          <Text style={styles.itemName}>{item.name}</Text>

          <View style={styles.tagsRow}>
            <View style={[styles.spiceBadge, { backgroundColor: spiceColor + '20' }]}>
              <Text style={[styles.spiceText, { color: spiceColor }]}>{item.spice_level}</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="time" size={14} color={colors.textSecondary} />
              <Text style={styles.tagText}>{item.prep_time}</Text>
            </View>
          </View>

          <Text style={styles.itemPrice}>Rs. {item.price.toLocaleString()}</Text>

          {item.discount > 0 && (
            <View style={styles.discountRow}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}% OFF</Text>
              </View>
              <Text style={styles.originalPrice}>
                Rs. {Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}
              </Text>
            </View>
          )}

          {item.description && (
            <>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{item.description}</Text>
            </>
          )}

          {item.tags && item.tags.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionLabel}>Reviews</Text>
              {reviews.length > 0 ? (
                <View style={styles.avgRating}>
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text style={styles.avgRatingValue}>{avgRating}</Text>
                  <Text style={styles.avgRatingCount}>({reviews.length})</Text>
                </View>
              ) : (
                <ActivityIndicator size="small" color={colors.textSecondary} />
              )}
            </View>

            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.user_name || 'Anonymous'}</Text>
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color={star <= review.rating ? '#F59E0B' : '#D1D5DB'}
                      />
                    ))}
                  </View>
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))
            ) : (
              <View style={styles.noReviews}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.textSecondary} />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              </View>
            )}
          </View>

          {item.is_new && (
            <View style={styles.newBadgeInline}>
              <Ionicons name="sparkles" size={16} color="#FFF" />
              <Text style={styles.newTextInline}>New Item</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
