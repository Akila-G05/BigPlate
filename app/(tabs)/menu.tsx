import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { APP_COLORS } from "../../src/constants";
import { useCart } from "../../src/context/CartContext";
import { useTheme } from "../../src/context/ThemeContext";
import type { ThemeColors } from "../../src/context/ThemeContext";
import { supabase } from "../../src/lib/supabaseClient";
import { FoodImage } from "../../src/components/FoodImage";

type Category = { id: string; name: string; image: string; sort_order: number };
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
  is_available: boolean;
};

function AnimatedItemCard({
  item,
  index,
  router,
  addToCart,
  colors,
}: {
  item: MenuItem;
  index: number;
  router: any;
  addToCart: (item: MenuItem) => void;
  colors: ThemeColors;
}) {
  const anim = useState(new Animated.Value(0))[0];
  const s = createStyles(colors);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      delay: index * 80,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={s.itemCard}
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
        <FoodImage uri={item.image} size={80} borderRadius={12} />
        <View style={s.itemInfo}>
          <Text style={s.itemName}>{item.name}</Text>
          <Text style={s.itemDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={s.itemFooter}>
            <Text style={s.itemPrice}>
              Rs. {item.price.toLocaleString()}
            </Text>
            <TouchableOpacity
              style={s.addButton}
              onPress={(e) => {
                e.stopPropagation();
                addToCart(item);
              }}
            >
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={s.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, paddingTop: 50 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.background },
  loadingText: { marginTop: 12, fontSize: 16, color: c.textSecondary },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.card,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: c.text },
  categories: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20, gap: 8 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  categoryChipImage: { marginRight: 6, overflow: "hidden" },
  categoryText: { fontSize: 13, color: c.textSecondary },
  categoryTextActive: { color: "#FFF", fontWeight: "600" },
  list: { paddingHorizontal: 20, paddingBottom: 200, marginBottom: 500 },
  itemCard: {
    flexDirection: "row",
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: c.border,
  },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  itemName: { fontSize: 16, fontWeight: "600", color: c.text },
  itemDesc: { fontSize: 13, color: c.textSecondary, marginTop: 4 },
  itemFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  itemPrice: { fontSize: 16, fontWeight: "700", color: APP_COLORS.primary },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 2,
  },
  addButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  empty: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: c.textSecondary, marginTop: 12 },
});

export default function MenuScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();
  const styles = createStyles(colors);

  const selectedCategory = (params.category as string) || null;

  const fetchData = async () => {
    try {
      const [catsRes, itemsRes] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("menu_items").select("*").eq("is_available", true).order("sort_order", { ascending: true }),
      ]);
      if (catsRes.data) setCategories(catsRes.data);
      if (itemsRes.data) setMenuItems(itemsRes.data);
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
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

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={APP_COLORS.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textSecondary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(cat) => cat.id}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === item.id && styles.categoryChipActive]}
            onPress={() => {
              if (selectedCategory === item.id) {
                router.setParams({ category: undefined });
              } else {
                router.setParams({ category: item.id });
              }
            }}
          >
            <FoodImage uri={item.image} size={24} borderRadius={12} style={styles.categoryChipImage} />
            <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[APP_COLORS.primary]}
            tintColor={APP_COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedItemCard
            item={item}
            index={index}
            router={router}
            addToCart={addToCart}
            colors={colors}
          />
        )}
      />
    </View>
  );
}
