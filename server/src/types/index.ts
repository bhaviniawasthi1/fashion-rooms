export interface Room {
  id: string;
  name: string;
  occasion: string;
  max_members: number;
  duration_days: number;
  invite_code: string;
  created_by: string;
  status: 'active' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface RoomWithMeta extends Room {
  member_count: number;
  owner_name: string;
  is_owner: boolean;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string | null;
  content: string;
  type: 'text' | 'system';
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
}

export interface SharedCartItem {
  id: string;
  room_id: string;
  product_id: string;
  added_by: string;
  quantity: number;
  added_at: string;
  added_by_name: string;
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    original_price: number;
    image: string;
    colors: string[];
    sizes: string[];
  };
}

export interface Activity {
  id: string;
  room_id: string;
  user_id: string | null;
  action_type: ActivityActionType;
  data: Record<string, unknown>;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
}

export type ActivityActionType =
  | 'room_created'
  | 'member_joined'
  | 'member_left'
  | 'product_added'
  | 'product_removed'
  | 'vote_cast'
  | 'ai_suggestion'
  | 'checkout_completed'
  | 'room_expired'
  | 'message_sent';

export type VoteType = 'approval' | 'color' | 'size' | 'budget';

export interface VoteCount {
  vote_type: VoteType;
  values: Record<string, number>;
  total: number;
}

export interface UserVote {
  vote_type: VoteType;
  vote_value: string;
}

export interface CreateRoomInput {
  name: string;
  occasion: string;
  max_members: number;
  duration_days: number;
}

export interface JoinRoomInput {
  invite_code: string;
}
