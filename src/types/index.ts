export type UserRole = 'USER' | 'SELLER' | 'AGENT' | 'AGENCY' | 'ADMIN' | 'SUPER_ADMIN';

export type ListingType = 'SALE' | 'RENT' | 'BUY';

export type PropertyCategory =
  | 'APARTMENT'
  | 'HOUSE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'WAREHOUSE'
  | 'OFFICE'
  | 'FARM';

export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'RENTED' | 'UNAVAILABLE';

export type PublicationStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'ARCHIVED';

export type InquiryStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CLOSED';

export type ViewingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentMethod = 'EXPRESS' | 'UNITEL_MONEY' | 'BANK_TRANSFER' | 'CASH' | 'CARD';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  agency_name: string | null;
  agent_license: string | null;
  bio: string | null;
  province: string | null;
  city: string | null;
  is_verified: boolean;
  is_blocked: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  agent_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  listing_type: ListingType;
  category: PropertyCategory;
  price: number;
  currency: string;
  province: string;
  municipality: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  amenities: string[];
  property_status: PropertyStatus;
  publication_status: PublicationStatus;
  featured: boolean;
  promoted: boolean;
  view_count: number;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  url: string;
  storage_path: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface Inquiry {
  id: string;
  property_id: string;
  user_id: string | null;
  recipient_id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  channel: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface Conversation {
  id: string;
  property_id: string | null;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  property?: Property;
  otherParticipant?: Profile;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ViewingRequest {
  id: string;
  property_id: string;
  user_id: string;
  agent_id: string | null;
  requested_date: string;
  requested_time: string;
  status: ViewingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
}

export interface Payment {
  id: string;
  property_id: string | null;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  reference: string | null;
  transaction_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: Profile;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  price: number;
  currency: string;
  billing_cycle: string;
  max_listings: number;
  featured_listings: number;
  has_analytics: boolean;
  has_priority_support: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  plan?: Plan;
  user?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
