export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  is_trending: boolean;
  discount?: number;
  is_new?: boolean;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  branch: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  image: string;
  valid_until: string;
}
