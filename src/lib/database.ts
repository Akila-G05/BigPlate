import { supabase } from './supabaseClient';
import type { MenuItem, Category, Order, Promotion } from '../types';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data as Category[];
}

export async function getMenuItems(categoryId?: string) {
  let query = supabase
    .from('menu_items')
    .select('*, categories(name)')
    .eq('is_available', true)
    .order('sort_order', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as MenuItem[];
}

export async function getTrendingItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_trending', true)
    .eq('is_available', true)
    .limit(4);
  if (error) throw error;
  return data as MenuItem[];
}

export async function getPromotions() {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Promotion[];
}

export async function createOrder(order: {
  user_id: string;
  branch: string;
  total: number;
  delivery_fee: number;
  payment_method: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_instructions?: string;
  items: { menu_item_id: string; name: string; quantity: number; price: number }[];
}) {
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: order.user_id,
      branch: order.branch,
      total: order.total,
      delivery_fee: order.delivery_fee,
      payment_method: order.payment_method,
      delivery_name: order.delivery_name,
      delivery_phone: order.delivery_phone,
      delivery_address: order.delivery_address,
      delivery_instructions: order.delivery_instructions,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = order.items.map((item) => ({
    order_id: orderData.id,
    menu_item_id: item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
}

export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Order[];
}

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('menu_item_id, menu_items(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function addFavorite(userId: string, menuItemId: string) {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, menu_item_id: menuItemId });
  if (error) throw error;
}

export async function removeFavorite(userId: string, menuItemId: string) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('menu_item_id', menuItemId);
  if (error) throw error;
}
