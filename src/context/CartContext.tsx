import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { CartItem, MenuItem } from '../types';

const LOCAL_CART_KEY = 'bigplate_cart_local';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const mergingRef = useRef(false);

  // Load cart on mount and auth change
  useEffect(() => {
    let cancelled = false;

    const loadCart = async () => {
      setLoading(true);
      try {
        if (user) {
          // Logged in: fetch from Supabase
          const { data, error } = await supabase
            .from('cart_items')
            .select('*, menu_items(*)')
            .eq('user_id', user.id);

          if (error) throw error;

          if (!cancelled) {
            const cartItems: CartItem[] = (data || [])
              .filter((row) => row.menu_items)
              .map((row) => ({
                menu_item: row.menu_items,
                quantity: row.quantity,
              }));
            setItems(cartItems);
          }
        } else {
          // Guest: load from AsyncStorage
          const localData = await AsyncStorage.getItem(LOCAL_CART_KEY);
          if (!cancelled) {
            setItems(localData ? JSON.parse(localData) : []);
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCart();
    return () => { cancelled = true; };
  }, [user]);

  // Merge local cart into DB cart when user logs in
  useEffect(() => {
    if (!user || mergingRef.current) return;

    const mergeLocalCart = async () => {
      mergingRef.current = true;
      try {
        const localData = await AsyncStorage.getItem(LOCAL_CART_KEY);
        if (!localData) {
          mergingRef.current = false;
          return;
        }

        const localItems: CartItem[] = JSON.parse(localData);
        if (localItems.length === 0) {
          mergingRef.current = false;
          return;
        }

        // Upsert local items into DB
        const upsertData = localItems.map((item) => ({
          user_id: user.id,
          menu_item_id: item.menu_item.id,
          quantity: item.quantity,
        }));

        await supabase
          .from('cart_items')
          .upsert(upsertData, { onConflict: 'user_id,menu_item_id' });

        // Clear local cart after merge
        await AsyncStorage.removeItem(LOCAL_CART_KEY);

        // Reload cart from DB (now includes merged items)
        const { data } = await supabase
          .from('cart_items')
          .select('*, menu_items(*)')
          .eq('user_id', user.id);

        const cartItems: CartItem[] = (data || [])
          .filter((row) => row.menu_items)
          .map((row) => ({
            menu_item: row.menu_items,
            quantity: row.quantity,
          }));

        setItems(cartItems);
      } catch (error) {
        console.error('Failed to merge local cart:', error);
      } finally {
        mergingRef.current = false;
      }
    };

    mergeLocalCart();
  }, [user]);

  // Save to AsyncStorage when guest cart changes
  useEffect(() => {
    if (!user && !loading && !mergingRef.current) {
      AsyncStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    }
  }, [items, user, loading]);

  const addToCart = useCallback(async (menuItem: MenuItem) => {
    // Always update local state first for instant feedback
    setItems((prev) => {
      const existing = prev.find((i) => i.menu_item.id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item.id === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { menu_item: menuItem, quantity: 1 }];
    });

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .upsert(
            { user_id: user.id, menu_item_id: menuItem.id, quantity: 1 },
            { onConflict: 'user_id,menu_item_id' }
          );
      } catch (error) {
        console.error('Failed to sync cart to DB:', error);
      }
    }
  }, [user]);

  const removeFromCart = useCallback(async (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.menu_item.id !== itemId));
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('menu_item_id', itemId);
      } catch (error) {
        console.error('Failed to remove from cart (DB):', error);
      }
    }
  }, [user]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menu_item.id !== itemId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.menu_item.id === itemId ? { ...i, quantity } : i
        )
      );
    }
    if (user) {
      try {
        if (quantity <= 0) {
          await supabase.from('cart_items').delete().eq('user_id', user.id).eq('menu_item_id', itemId);
        } else {
          await supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('menu_item_id', itemId);
        }
      } catch (error) {
        console.error('Failed to update cart (DB):', error);
      }
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear cart (DB):', error);
      }
    } else {
      await AsyncStorage.removeItem(LOCAL_CART_KEY);
    }
  }, [user]);

  const total = items.reduce(
    (sum, i) => sum + i.menu_item.price * i.quantity,
    0
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
