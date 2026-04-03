import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartItem, MenuItem } from '../types';

const CART_STORAGE_KEY = 'bigplate_cart';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setItems(JSON.parse(data));
        } catch {
          setItems([]);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addToCart = useCallback((menuItem: MenuItem) => {
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
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.menu_item.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menu_item.id !== itemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menu_item.id === itemId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce(
    (sum, i) => sum + i.menu_item.price * i.quantity,
    0
  );

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}
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
