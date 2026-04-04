import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';
import { FoodImage } from '../../src/components/FoodImage';

type FavoriteItem = {
  id: string;
  user_id: string;
  menu_item_id: string;
  menu_items: {
    id: string;
    name: string;
    price: number;
    image: string;
    category_id: string;
  };
};

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id, user_id, menu_item_id, menu_items(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (id: string) => {
    try {
      const { error } = await supabase.from('favorites').delete().eq('id', id);
      if (error) throw error;
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (!user) {
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
          <Ionicons name="lock-closed-outline" size={64} color={APP_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySubtitle}>Please sign in to view your favorites</Text>
          <TouchableOpacity style={styles.browseButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.browseText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={APP_COLORS.primary} />
        </View>
      </View>
    );
  }

  if (favorites.length === 0) {
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
        data={favorites}
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
                  id: item.menu_items?.id,
                  name: item.menu_items?.name,
                  price: item.menu_items?.price.toString(),
                  image: item.menu_items?.image,
                  category_id: item.menu_items?.category_id,
                  is_trending: 'true',
                },
              })
            }
          >
            <FoodImage uri={item.menu_items?.image} size={70} borderRadius={12} />
            <View style={styles.favInfo}>
              <Text style={styles.favName}>{item.menu_items?.name}</Text>
              <Text style={styles.favPrice}>Rs. {item.menu_items?.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item.id)}>
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
  favInfo: { flex: 1, marginLeft: 12 },
  favName: { fontSize: 16, fontWeight: '600', color: APP_COLORS.text },
  favPrice: { fontSize: 16, fontWeight: '700', color: APP_COLORS.primary, marginTop: 4 },
  removeButton: { padding: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  browseButton: { backgroundColor: APP_COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 },
  browseText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
