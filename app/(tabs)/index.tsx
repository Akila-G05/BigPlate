import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { APP_COLORS } from "../../src/constants";
import { useCart } from "../../src/context/CartContext";
import { useNotifications } from "../../src/context/NotificationContext";
import { useTheme } from "../../src/context/ThemeContext";
import type { ThemeColors } from "../../src/context/ThemeContext";
import { supabase } from "../../src/lib/supabaseClient";
import { FoodImage } from "../../src/components/FoodImage";

type Category = { id: string; name: string; image: string };
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
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.background },
  loadingText: { marginTop: 12, fontSize: 16, color: c.textSecondary },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: c.card },
  greeting: { fontSize: 14, color: c.textSecondary },
  branchSelector: { flexDirection: "row", alignItems: "center", gap: 4 },
  branchName: { fontSize: 18, fontWeight: "700", color: c.text },
  cartButton: { position: "relative", padding: 8 },
  badge: { position: "absolute", top: 0, right: 0, backgroundColor: APP_COLORS.primary, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  heroBanner: { margin: 20, backgroundColor: APP_COLORS.primary, borderRadius: 20, padding: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroContent: { flex: 1 },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#FFF", marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 16 },
  heroButton: { backgroundColor: "#FFF", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, alignSelf: "flex-start" },
  heroButtonText: { color: APP_COLORS.primary, fontWeight: "700", fontSize: 14 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: c.text, marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { color: APP_COLORS.primary, fontSize: 14, fontWeight: "600" },
  categoriesScroll: { flexDirection: "row" },
  categoryItem: { alignItems: "center", marginRight: 16 },
  categoryName: { marginTop: 6, fontSize: 12, color: c.textSecondary },
  trendingCard: { width: 180, backgroundColor: c.card, borderRadius: 16, padding: 12, marginRight: 12, borderWidth: 1, borderColor: c.border, position: "relative" },
  trendingImage: { width: "100%", height: 100, borderRadius: 12, marginBottom: 8 },
  trendingName: { fontSize: 14, fontWeight: "600", color: c.text, textAlign: "center" },
  trendingInfo: { marginTop: 4 },
  trendingPrice: { fontSize: 16, fontWeight: "700", color: APP_COLORS.primary, marginTop: 4, textAlign: "center" },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: APP_COLORS.primary, borderRadius: 8, paddingVertical: 6, marginTop: 8, gap: 2 },
  addButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  discountBadge: { position: "absolute", top: 8, right: 8, backgroundColor: APP_COLORS.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  newBadge: { position: "absolute", top: 8, right: 8, backgroundColor: APP_COLORS.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newText: { color: "#FFF", fontSize: 10, fontWeight: "700" },
  infoSection: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 24, gap: 12 },
  infoCard: { flex: 1, backgroundColor: c.card, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: c.border },
  infoValue: { fontSize: 20, fontWeight: "800", color: c.text, marginTop: 8 },
  infoLabel: { fontSize: 11, color: c.textSecondary, textAlign: "center" },
  promoBanner: { flexDirection: "row", alignItems: "center", backgroundColor: APP_COLORS.primaryDark, marginHorizontal: 20, marginBottom: 24, borderRadius: 16, padding: 16, gap: 12 },
  promoIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  promoInfo: { flex: 1 },
  promoTitle: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  promoSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
});

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addToCart, itemCount } = useCart();
  const { unreadCount } = useNotifications();
  const styles = createStyles(colors);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingItems, setTrendingItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalItems: 0, avgRating: 0, totalReviews: 0 });

  const fetchData = async () => {
    try {
      const [catsRes, trendingRes, itemsCountRes, reviewsRes] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("menu_items").select("*").eq("is_trending", true).eq("is_available", true).limit(4),
        supabase.from("menu_items").select("id", { count: "exact", head: true }).eq("is_available", true),
        supabase.from("reviews").select("rating"),
      ]);

      if (catsRes.data) setCategories(catsRes.data);
      if (trendingRes.data) setTrendingItems(trendingRes.data);

      // Calculate real stats
      const totalItems = itemsCountRes.count || 0;
      const reviews = reviewsRes.data || [];
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : "0.0";

      setStats({ totalItems, avgRating: parseFloat(avgRating), totalReviews });
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome to</Text>
          <TouchableOpacity style={styles.branchSelector}>
            <Text style={styles.branchName}>BigPlate</Text>
            <Ionicons name="restaurant" size={16} color={APP_COLORS.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[APP_COLORS.primary]}
            tintColor={APP_COLORS.primary}
          />
        }
      >
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Delicious Food,{"\n"}Delivered Fast
            </Text>
            <Text style={styles.heroSubtitle}>
              Indian, Chinese, Arabic & Western cuisines
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push("/(tabs)/menu")}
            >
              <Text style={styles.heroButtonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <FoodImage
            uri="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop"
            size={100}
            borderRadius={16}
          />
        </View>

        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryItem}
                  onPress={() => router.push({ pathname: "/(tabs)/menu", params: { category: cat.id } })}
                >
                  <FoodImage uri={cat.image} size={64} borderRadius={16} />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {trendingItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/menu")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={trendingItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.trendingCard}
                  onPress={() =>
                    router.push({
                      pathname: "/item/[id]",
                      params: {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price.toString(),
                        image: item.image,
                        category_id: item.category_id,
                        is_trending: item.is_trending.toString(),
                      },
                    })
                  }
                >
                  <FoodImage
                    uri={item.image}
                    size={160}
                    borderRadius={12}
                    style={styles.trendingImage}
                  />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.trendingPrice}>
                      Rs. {item.price.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(item)}
                    >
                      <Ionicons name="add" size={18} color="#FFF" />
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                  {item.discount > 0 && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {item.discount}% OFF
                      </Text>
                    </View>
                  )}
                  {item.is_new && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newText}>NEW</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color={APP_COLORS.primary} />
            <Text style={styles.infoValue}>25min</Text>
            <Text style={styles.infoLabel}>Avg Delivery</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="star" size={24} color={APP_COLORS.warning} />
            <Text style={styles.infoValue}>4.9</Text>
            <Text style={styles.infoLabel}>37.1K+ Reviews</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="fast-food" size={24} color={APP_COLORS.success} />
            <Text style={styles.infoValue}>250+</Text>
            <Text style={styles.infoLabel}>Menu Items</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.promoBanner}
          onPress={() => router.push("/promotions")}
        >
          <View style={styles.promoIcon}>
            <Ionicons name="gift" size={28} color="#FFF" />
          </View>
          <View style={styles.promoInfo}>
            <Text style={styles.promoTitle}>Special Offers!</Text>
            <Text style={styles.promoSubtitle}>
              Get up to 25% off on your order
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
