import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS, CATEGORIES } from '../../src/constants';
import { useCart } from '../../src/context/CartContext';
import type { MenuItem } from '../../src/types';
import { FOOD_IMAGES } from '../../src/types';

const ALL_ITEMS: MenuItem[] = [
  { id: '1', name: 'Tower Burger', description: 'Massive stacked burger with premium toppings', price: 3100, image: FOOD_IMAGES.burger, category_id: 'burgers', is_trending: true },
  { id: '2', name: 'Beef Burger', description: 'Classic beef burger with special sauce', price: 850, image: FOOD_IMAGES.beef_burger, category_id: 'burgers', is_trending: true, discount: 20 },
  { id: '3', name: 'Chicken Submarine', description: 'Loaded chicken sub with fresh veggies', price: 1200, image: FOOD_IMAGES.sub, category_id: 'subs', is_trending: true, is_new: true },
  { id: '4', name: 'Devilled Chicken', description: 'Spicy Indo-Chinese devilled chicken', price: 1100, image: FOOD_IMAGES.devilled_chicken, category_id: 'chinese', is_trending: true },
  { id: '5', name: 'Chicken Fried Rice', description: 'Wok-fried rice with chicken and vegetables', price: 950, image: FOOD_IMAGES.fried_rice, category_id: 'rice', is_trending: false },
  { id: '6', name: 'Chicken Biryani', description: 'Aromatic basmati rice with spiced chicken', price: 1050, image: FOOD_IMAGES.biryani, category_id: 'indian', is_trending: false },
  { id: '7', name: 'Chicken Kottu', description: 'Chopped roti with chicken and spices', price: 900, image: FOOD_IMAGES.kottu, category_id: 'kottu', is_trending: false },
  { id: '8', name: 'Garlic Naan', description: 'Fresh baked garlic naan bread', price: 350, image: FOOD_IMAGES.naan, category_id: 'indian', is_trending: false },
  { id: '9', name: 'Chilli Beef', description: 'Spicy stir-fried beef with peppers', price: 1200, image: FOOD_IMAGES.chilli_beef, category_id: 'chinese', is_trending: false },
  { id: '10', name: 'Mango Lassi', description: 'Creamy yogurt mango smoothie', price: 450, image: FOOD_IMAGES.lassi, category_id: 'drinks', is_trending: false },
];

export default function MenuScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();

  const filteredItems = ALL_ITEMS.filter((item) => {
    const matchCategory = selectedCategory ? item.category_id === selectedCategory : true;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={APP_COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={APP_COLORS.textSecondary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={APP_COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(cat) => cat.id}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() =>
              setSelectedCategory(selectedCategory === item.id ? null : item.id)
            }
          >
            <Image source={{ uri: item.image }} style={styles.categoryChipImage} />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item.id && styles.categoryTextActive,
              ]}
            >
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="restaurant-outline" size={48} color={APP_COLORS.textSecondary} />
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemCard}
            onPress={() =>
              router.push({
                pathname: '/item/[id]',
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
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>Rs. {item.price.toLocaleString()}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    addToCart(item);
                  }}
                >
                  <Ionicons name="add" size={18} color="#FFF" />
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background, paddingTop: 50 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: APP_COLORS.text },
  categories: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  categoryChipImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  categoryText: { fontSize: 13, color: APP_COLORS.textSecondary },
  categoryTextActive: { color: '#FFF', fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '600', color: APP_COLORS.text },
  itemDesc: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 4 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: APP_COLORS.primary },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 2,
  },
  addButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: APP_COLORS.textSecondary, marginTop: 12 },
});
