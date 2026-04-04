import { supabase } from './supabaseClient';

export async function getCartItems(userId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, menu_items(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function addToCart(userId: string, menuItemId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert(
      { user_id: userId, menu_item_id: menuItemId, quantity: 1 },
      { onConflict: 'user_id,menu_item_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function incrementCartItem(userId: string, menuItemId: string) {
  const { data, error } = await supabase.rpc('increment_cart_quantity', {
    p_user_id: userId,
    p_menu_item_id: menuItemId,
  });
  if (error) {
    const { data: updated, error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity: supabase.raw('quantity + 1'), updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId)
      .select()
      .single();
    if (updateError) throw updateError;
    return updated;
  }
  return data;
}

export async function updateCartItemQuantity(userId: string, menuItemId: string, quantity: number) {
  if (quantity <= 0) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);
    if (error) throw error;
    return null;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('menu_item_id', menuItemId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromCart(userId: string, menuItemId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('menu_item_id', menuItemId);
  if (error) throw error;
}

export async function clearCart(userId: string) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}

export async function mergeCartItems(userId: string, localItems: { id: string; quantity: number }[]) {
  if (localItems.length === 0) return;

  const upsertData = localItems.map((item) => ({
    user_id: userId,
    menu_item_id: item.id,
    quantity: item.quantity,
  }));

  const { error } = await supabase
    .from('cart_items')
    .upsert(upsertData, { onConflict: 'user_id,menu_item_id' });

  if (error) throw error;
}
