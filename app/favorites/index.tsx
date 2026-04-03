import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { FOOD_IMAGES } from '../../src/types';
import { FoodImage } from '../../src/components/FoodImage';

const FAVORITES = [
  { id: '1', name: 'Tower Burger', price: 3100, image: FOOD_IMAGES.burger, category: 'Burgers' },
  { id: '4', name: 'Devilled Chicken', price: 1100, image: FOOD_IMAGES.devilled_chicken, category: 'Chinese' },
  { id: '6', name: 'Chicken Biryani', price: 1050, image: FOOD_IMAGES.biryani, category: 'Indian' },
];

export default function FavoritesScreen() {
  const router = useRouter();

  if (FAVORITES.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={APP_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>Save your favorite dishes for quick ordering</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.browseText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={FAVORITES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.favCard}
            onPress={() =>
              router.push({
                pathname: '/item/[id]',
                params: {
                  id: item.id,
                  name: item.name,
                  price: item.price.toString(),
                  image: item.image,
                  category_id: item.category.toLowerCase(),
                  is_trending: 'true',
                },
              })
            }
          >
            <FoodImage uri={item.image} size={70} borderRadius={12} />
            <View style={styles.favInfo}>
              <Text style={styles.favName}>{item.name}</Text>
              <Text style={styles.favCategory}>{item.category}</Text>
              <Text style={styles.favPrice}>Rs. {item.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton}>
              <Ionicons name="heart-dislike" size={22} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
  list: { padding: 20, paddingBottom: 100 },
  favCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  favImage: { width: 70, height: 70, borderRadius: 12 },
  favInfo: { flex: 1, marginLeft: 12 },
  favName: { fontSize: 16, fontWeight: '600', color: APP_COLORS.text },
  favCategory: { fontSize: 13, color: APP_COLORS.textSecondary, marginTop: 2 },
  favPrice: { fontSize: 16, fontWeight: '700', color: APP_COLORS.primary, marginTop: 4 },
  removeButton: { padding: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  browseButton: { backgroundColor: APP_COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  browseText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
