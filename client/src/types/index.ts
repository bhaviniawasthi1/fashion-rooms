export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price: number;
  images: string[];
  category: string;
  rating: number;
  description: string;
  colors: string[];
  sizes: string[];
}

export interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  wishId: string;
  product: Product;
}

export interface Room {
  id: string;
  name: string;
  occasion: string;
  status: 'active' | 'expired';
  member_count: number;
  max_members: number;
  owner_name: string;
  is_owner: boolean;
  created_at: string;
  expires_at: string;
  invite_code: string;
}

export interface Message {
  id: string;
  type: 'user' | 'system';
  content: string;
  user?: { id: string; name: string; avatar?: string };
  created_at: string;
}

export type VoteType = 'approval' | 'color' | 'size';

export interface VoteCount {
  vote_type: VoteType;
  values: Record<string, number>;
}

export interface Activity {
  id: string;
  action_type: string;
  user?: { id: string; name: string };
  created_at: string;
}

export interface RoomMember {
  id: string;
  user_id: string;
  name: string;
  role: string;
  is_online?: boolean;
}

export interface OrderItem {
  checkout_id: string;
  product_id: string;
  name: string;
  brand: string;
  price: number;
  original_price: number;
  image: string | null;
  category: string;
  quantity: number;
  purchased_at: string;
  room_id: string | null;
  room_name: string | null;
  room_occasion: string | null;
  coins_awarded: number;
  coins_expiry: string | null;
}

export interface MynCoin {
  id: string;
  room_id: string;
  room_name: string;
  amount: number;
  expiry_date: string;
  awarded_at: string;
  expired: boolean;
}

export const MAX_ROOMS_PER_USER = 5;

export const OCCASIONS = [
  'Wedding', 'Trip', 'Party', 'College', 'Office',
  'Festival', 'Birthday', 'Casual', 'Date', 'Vacation',
] as const;

export const MAX_MEMBERS_OPTIONS = [3, 5, 8, 10] as const;

export const DURATION_OPTIONS = [3, 7, 14, 30] as const;
