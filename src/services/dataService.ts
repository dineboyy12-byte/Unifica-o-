import { supabase } from '@/lib/supabase';
import type { Favorite, Inquiry, ViewingRequest, Payment, Profile, AuditLog } from '@/types';

// Favorites
export async function getFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      property:properties(
        *,
        images:property_images(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Favorite[];
}

export async function toggleFavorite(userId: string, propertyId: string): Promise<boolean> {
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('favorites').insert({ user_id: userId, property_id: propertyId });
    return true;
  }
}

export async function isFavorited(userId: string, propertyId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle();
  return !!data;
}

// Inquiries
export async function createInquiry(input: {
  property_id: string;
  recipient_id: string;
  user_id?: string | null;
  name: string;
  phone: string;
  email?: string;
  message: string;
}): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      property_id: input.property_id,
      recipient_id: input.recipient_id,
      user_id: input.user_id || null,
      name: input.name,
      phone: input.phone,
      email: input.email,
      message: input.message,
      channel: 'FORM',
      status: 'NEW',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Inquiry;
}

export async function getMyInquiries(userId: string): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Inquiry[];
}

export async function updateInquiryStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase.from('inquiries').update({ status }).eq('id', id);
  if (error) throw error;
}

// Viewing Requests
export async function createViewingRequest(input: {
  property_id: string;
  user_id: string;
  requested_date: string;
  requested_time: string;
  notes?: string;
}): Promise<ViewingRequest> {
  const { data, error } = await supabase
    .from('viewing_requests')
    .insert({
      property_id: input.property_id,
      user_id: input.user_id,
      requested_date: input.requested_date,
      requested_time: input.requested_time,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ViewingRequest;
}

export async function getMyViewingRequests(userId: string): Promise<ViewingRequest[]> {
  const { data, error } = await supabase
    .from('viewing_requests')
    .select(`
      *,
      property:properties(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as ViewingRequest[];
}

export async function getViewingRequestsForOwner(ownerId: string): Promise<ViewingRequest[]> {
  const { data, error } = await supabase
    .from('viewing_requests')
    .select(`
      *,
      property:properties!inner(*)
    `)
    .eq('property.owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as ViewingRequest[];
}

// Payments
export async function createPayment(input: {
  property_id?: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  description?: string;
  reference?: string;
}): Promise<Payment> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      property_id: input.property_id || null,
      user_id: input.user_id,
      amount: input.amount,
      currency: input.currency,
      payment_method: input.payment_method,
      status: 'PENDING',
      description: input.description,
      reference: input.reference,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Payment;
}

export async function getMyPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Payment[];
}

// Profiles
export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Profile[];
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

// Audit Logs
export async function createAuditLog(input: {
  actor_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await supabase.from('audit_logs').insert({
    actor_id: input.actor_id || null,
    action: input.action,
    entity_type: input.entity_type || null,
    entity_id: input.entity_id || null,
    metadata: input.metadata || {},
  });
}

export async function getAuditLogs(limit = 50): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles!audit_logs_actor_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as unknown as AuditLog[];
}

// Admin stats
export async function getAdminStats(): Promise<{
  totalProperties: number;
  publishedProperties: number;
  pendingProperties: number;
  totalUsers: number;
  totalInquiries: number;
  soldProperties: number;
  rentedProperties: number;
}> {
  const [properties, pending, users, inquiries] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('publication_status', 'PUBLISHED'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('publication_status', 'PENDING_REVIEW'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
  ]);

  const [sold, rented] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('property_status', 'SOLD'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('property_status', 'RENTED'),
  ]);

  return {
    totalProperties: properties.count || 0,
    publishedProperties: properties.count || 0,
    pendingProperties: pending.count || 0,
    totalUsers: users.count || 0,
    totalInquiries: inquiries.count || 0,
    soldProperties: sold.count || 0,
    rentedProperties: rented.count || 0,
  };
}
