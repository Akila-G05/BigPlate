import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';
import { FoodImage } from '../../src/components/FoodImage';

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  menu_item_id: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: c.card },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  scrollContent: { padding: 20, paddingBottom: 100 },
  orderInfo: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: c.border },
  orderInfoText: { fontSize: 14, color: c.textSecondary, marginBottom: 4 },
  orderInfoValue: { fontSize: 16, fontWeight: '600', color: c.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 },
  itemCard: { backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  itemImage: { borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: '600', color: c.text, flex: 1 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  starButton: { padding: 4 },
  commentInput: { backgroundColor: c.input, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.text, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  submitButton: { backgroundColor: APP_COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  existingReview: { backgroundColor: c.card, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: c.border },
  existingReviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  existingReviewBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  existingReviewBadgeText: { fontSize: 11, fontWeight: '600', color: '#92400E' },
  existingReviewStars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  existingReviewComment: { fontSize: 14, color: c.text, lineHeight: 20, fontStyle: 'italic' },
  existingReviewDate: { fontSize: 12, color: c.textSecondary, marginTop: 8 },
  editDivider: { height: 1, backgroundColor: c.border, marginVertical: 12 },
  editLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  editLabelText: { fontSize: 12, fontWeight: '600', color: APP_COLORS.primary },
});

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const styles = createStyles(colors);

  const orderId = params.orderId as string;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch order items
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (itemsData) {
          setOrderItems(itemsData);
          // Initialize ratings and comments
          const initialRatings: Record<string, number> = {};
          const initialComments: Record<string, string> = {};
          const existingReviews: Record<string, Review> = {};

          for (const item of itemsData) {
            initialRatings[item.id] = 0;
            initialComments[item.id] = '';

            // Check if user already reviewed this item for this order
            const { data: reviewData } = await supabase
              .from('reviews')
              .select('*')
              .eq('user_id', user.id)
              .eq('order_id', orderId)
              .eq('menu_item_id', item.menu_item_id)
              .single();

            if (reviewData) {
              existingReviews[item.id] = reviewData;
              initialRatings[item.id] = reviewData.rating;
              initialComments[item.id] = reviewData.comment || '';
            }
          }

          setRatings(initialRatings);
          setComments(initialComments);
          setReviews(existingReviews);
        }
      } catch (error) {
        console.error('Failed to fetch review data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, orderId]);

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const setRating = (itemId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [itemId]: rating }));
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      showAlert('Error', 'Please select at least one item to review');
      return;
    }

    for (const itemId of selectedItems) {
      if (!ratings[itemId] || ratings[itemId] === 0) {
        showAlert('Error', 'Please rate all selected items');
        return;
      }
    }

    setSubmitting(true);
    try {
      for (const itemId of selectedItems) {
        const item = orderItems.find((i) => i.id === itemId);
        if (!item) continue;

        const reviewData = {
          user_id: user!.id,
          order_id: orderId,
          menu_item_id: item.menu_item_id,
          rating: ratings[itemId],
          comment: comments[itemId] || null,
        };

        const existingReview = reviews[itemId];
        if (existingReview) {
          // Update existing review
          const { error } = await supabase
            .from('reviews')
            .update({ rating: ratings[itemId], comment: comments[itemId] || null, updated_at: new Date().toISOString() })
            .eq('id', existingReview.id);
          if (error) throw error;
        } else {
          // Create new review
          const { error } = await supabase.from('reviews').insert(reviewData);
          if (error) throw error;
        }
      }

      showAlert('Success', 'Review(s) submitted successfully!');
      router.back();
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Write a Review</Text>
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
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderInfoText}>Order</Text>
          <Text style={styles.orderInfoValue}>#{orderId.slice(0, 8)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select items to review</Text>

        {orderItems.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          const existingReview = reviews[item.id];
          const rating = ratings[item.id] || 0;

          return (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemHeader}
                onPress={() => toggleItem(item.id)}
              >
                <Ionicons
                  name={isSelected ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={isSelected ? APP_COLORS.primary : colors.textSecondary}
                />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>x{item.quantity}</Text>
              </TouchableOpacity>

              {isSelected && (
                <>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity key={star} onPress={() => setRating(item.id, star)}>
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={32}
                          color={star <= rating ? '#F59E0B' : colors.textSecondary}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TextInput
                    style={styles.commentInput}
                    placeholder="Share your experience (optional)"
                    value={comments[item.id]}
                    onChangeText={(text) => setComments((prev) => ({ ...prev, [item.id]: text }))}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={colors.textSecondary}
                  />

                  {existingReview && (
                    <View style={styles.existingReview}>
                      <View style={styles.existingReviewHeader}>
                        <View style={styles.existingReviewBadge}>
                          <Ionicons name="time" size={12} color="#92400E" />
                          <Text style={styles.existingReviewBadgeText}>Previous Review</Text>
                        </View>
                      </View>
                      <View style={styles.existingReviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= existingReview.rating ? 'star' : 'star-outline'}
                            size={18}
                            color={star <= existingReview.rating ? '#F59E0B' : '#D1D5DB'}
                          />
                        ))}
                      </View>
                      {existingReview.comment && (
                        <Text style={styles.existingReviewComment}>"{existingReview.comment}"</Text>
                      )}
                      <Text style={styles.existingReviewDate}>
                        {new Date(existingReview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                      <View style={styles.editDivider} />
                      <View style={styles.editLabel}>
                        <Ionicons name="pencil" size={14} color={APP_COLORS.primary} />
                        <Text style={styles.editLabelText}>Editing your review</Text>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
