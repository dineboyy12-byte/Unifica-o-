import { supabase } from '@/lib/supabase';
import type { Profile, AuditLog, Property, Payment, Conversation, ViewingRequest } from '@/types';

// ============================================================
// TYPES
// ============================================================
export interface Lead {
  id: string;
  property_id: string | null;
  user_id: string | null;
  agent_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  stage: string;
  status: string;
  notes: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  agent?: Profile;
}

export interface CrmStage {
  id: string;
  name: string;
  code: string;
  sort_order: number;
  color: string;
  is_closed: boolean;
}

export interface ServiceProvider {
  id: string;
  user_id: string | null;
  company_name: string;
  category: string;
  phone: string | null;
  email: string | null;
  province: string | null;
  city: string | null;
  description: string | null;
  rating: number;
  is_approved: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  provider_id: string | null;
  user_id: string;
  category: string;
  description: string;
  address: string | null;
  province: string | null;
  scheduled_date: string | null;
  status: string;
  price: number | null;
  rating: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  target_url: string | null;
  position: string;
  start_date: string | null;
  end_date: string | null;
  impressions: number;
  clicks: number;
  is_active: boolean;
  created_at: string;
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

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  category: string;
  data_type: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
}

export interface LegalDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  version: number;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string | null;
  actor_id: string | null;
  type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
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

// ============================================================
// STATS / COMMAND CENTER
// ============================================================
export interface AdminStats {
  totalProperties: number;
  publishedProperties: number;
  pendingProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalUsers: number;
  newUsersThisMonth: number;
  totalInquiries: number;
  newLeads: number;
  scheduledViewings: number;
  totalRevenue: number;
  activeCampaigns: number;
  activeBanners: number;
  pendingServiceProviders: number;
  pendingServiceRequests: number;
  conversionRate: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [
    totalProps, publishedProps, pendingProps, soldProps, rentedProps,
    totalUsers, totalInquiries, newLeads, scheduledViewings,
    completedPayments, activeCampaigns, activeBanners,
    pendingProviders, pendingRequests
  ] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('publication_status', 'PUBLISHED'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('publication_status', 'PENDING_REVIEW'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('property_status', 'SOLD'),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('property_status', 'RENTED'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('stage', 'NEW'),
    supabase.from('viewing_requests').select('*', { count: 'exact', head: true }).eq('status', 'REQUESTED'),
    supabase.from('payments').select('amount', { count: 'exact' }).eq('status', 'COMPLETED'),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
    supabase.from('banners').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_approved', false).eq('is_suspended', false),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
  ]);

  const revenue = (completedPayments.data || []).reduce((sum, p: { amount?: number }) => sum + Number(p.amount || 0), 0);
  const totalLeads = newLeads.count || 0;
  const totalInq = totalInquiries.count || 0;
  const closedLeads = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('stage', 'CLOSED');
  const conversionRate = totalLeads + (totalInq || 0) > 0
    ? Math.round(((closedLeads.count || 0) / (totalLeads + (totalInq || 0))) * 100)
    : 0;

  // New users this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const newUsers = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthStart.toISOString());

  return {
    totalProperties: totalProps.count || 0,
    publishedProperties: publishedProps.count || 0,
    pendingProperties: pendingProps.count || 0,
    soldProperties: soldProps.count || 0,
    rentedProperties: rentedProps.count || 0,
    totalUsers: totalUsers.count || 0,
    newUsersThisMonth: newUsers.count || 0,
    totalInquiries: totalInq,
    newLeads: totalLeads,
    scheduledViewings: scheduledViewings.count || 0,
    totalRevenue: revenue,
    activeCampaigns: activeCampaigns.count || 0,
    activeBanners: activeBanners.count || 0,
    pendingServiceProviders: pendingProviders.count || 0,
    pendingServiceRequests: pendingRequests.count || 0,
    conversionRate,
  };
}

// ============================================================
// ALERTS
// ============================================================
export interface AdminAlert {
  id: string;
  type: string;
  message: string;
  count: number;
  severity: 'info' | 'warning' | 'danger';
  link: string;
}

export async function getAdminAlerts(): Promise<AdminAlert[]> {
  const stats = await getAdminStats();
  const alerts: AdminAlert[] = [];

  if (stats.pendingProperties > 0) {
    alerts.push({
      id: 'pending_properties',
      type: 'PENDING_PROPERTIES',
      message: `${stats.pendingProperties} imóvel(eis) aguardando aprovação`,
      count: stats.pendingProperties,
      severity: 'warning',
      link: '/admin?tab=pending',
    });
  }
  if (stats.newLeads > 0) {
    alerts.push({
      id: 'new_leads',
      type: 'NEW_LEADS',
      message: `${stats.newLeads} leads novos sem resposta`,
      count: stats.newLeads,
      severity: 'warning',
      link: '/admin?tab=leads',
    });
  }
  if (stats.scheduledViewings > 0) {
    alerts.push({
      id: 'upcoming_viewings',
      type: 'UPCOMING_VIEWINGS',
      message: `${stats.scheduledViewings} visitas agendadas`,
      count: stats.scheduledViewings,
      severity: 'info',
      link: '/admin?tab=viewings',
    });
  }
  if (stats.pendingServiceProviders > 0) {
    alerts.push({
      id: 'pending_providers',
      type: 'PENDING_PROVIDERS',
      message: `${stats.pendingServiceProviders} prestadores de serviço aguardando aprovação`,
      count: stats.pendingServiceProviders,
      severity: 'warning',
      link: '/admin?tab=services',
    });
  }
  if (stats.pendingServiceRequests > 0) {
    alerts.push({
      id: 'pending_requests',
      type: 'PENDING_REQUESTS',
      message: `${stats.pendingServiceRequests} pedidos de serviço pendentes`,
      count: stats.pendingServiceRequests,
      severity: 'info',
      link: '/admin?tab=services',
    });
  }

  // Check pending payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'PENDING');
  if (pendingPayments && pendingPayments > 0) {
    alerts.push({
      id: 'pending_payments',
      type: 'PENDING_PAYMENTS',
      message: `${pendingPayments} pagamentos pendentes`,
      count: pendingPayments,
      severity: 'warning',
      link: '/admin?tab=payments',
    });
  }

  // Failed payments
  const { count: failedPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'FAILED');
  if (failedPayments && failedPayments > 0) {
    alerts.push({
      id: 'failed_payments',
      type: 'FAILED_PAYMENTS',
      message: `${failedPayments} pagamentos com erro`,
      count: failedPayments,
      severity: 'danger',
      link: '/admin?tab=payments',
    });
  }

  return alerts;
}

// ============================================================
// PROPERTIES (admin)
// ============================================================
export async function adminGetAllProperties(filters: { status?: string; query?: string; sort?: string; limit?: number } = {}): Promise<Property[]> {
  let q = supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      agent:profiles!properties_agent_id_fkey(*),
      images:property_images(*)
    `);

  if (filters.status) q = q.eq('publication_status', filters.status);
  if (filters.query) q = q.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  q = q.order('created_at', { ascending: false }).limit(filters.limit || 100);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as Property[];
}

export async function adminUpdatePublicationStatus(id: string, status: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('properties').update({ publication_status: status }).eq('id', id);
  if (error) throw error;
  const actionMap: Record<string, string> = {
    PUBLISHED: 'PROPERTY_APPROVED',
    REJECTED: 'PROPERTY_REJECTED',
    CHANGES_REQUESTED: 'PROPERTY_CHANGES_REQUESTED',
    SUSPENDED: 'PROPERTY_SUSPENDED',
    ARCHIVED: 'PROPERTY_ARCHIVED',
  };
  await createAuditLog({ actor_id: actorId, action: actionMap[status] || 'PROPERTY_UPDATED', entity_type: 'property', entity_id: id });
}

export async function adminUpdatePropertyStatus(id: string, status: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('properties').update({ property_status: status }).eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'PROPERTY_UPDATED', entity_type: 'property', entity_id: id, metadata: { property_status: status } });
}

export async function adminToggleFeatured(id: string, featured: boolean, actorId?: string): Promise<void> {
  const { error } = await supabase.from('properties').update({ featured }).eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'PROPERTY_UPDATED', entity_type: 'property', entity_id: id, metadata: { featured } });
}

export async function adminTogglePromoted(id: string, promoted: boolean): Promise<void> {
  const { error } = await supabase.from('properties').update({ promoted }).eq('id', id);
  if (error) throw error;
}

export async function adminDeleteProperty(id: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'PROPERTY_DELETED', entity_type: 'property', entity_id: id });
}

export async function adminBulkApprove(ids: string[], actorId?: string): Promise<void> {
  const { error } = await supabase.from('properties').update({ publication_status: 'PUBLISHED' }).in('id', ids);
  if (error) throw error;
  for (const id of ids) {
    await createAuditLog({ actor_id: actorId, action: 'PROPERTY_APPROVED', entity_type: 'property', entity_id: id });
  }
}

export async function adminBulkSuspend(ids: string[], actorId?: string): Promise<void> {
  const { error } = await supabase.from('properties').update({ publication_status: 'SUSPENDED' }).in('id', ids);
  if (error) throw error;
  for (const id of ids) {
    await createAuditLog({ actor_id: actorId, action: 'PROPERTY_SUSPENDED', entity_type: 'property', entity_id: id });
  }
}

// ============================================================
// USERS (admin)
// ============================================================
export async function adminGetAllProfiles(query?: string): Promise<Profile[]> {
  let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (query) q = q.or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as Profile[];
}

export async function adminUpdateUserRole(userId: string, role: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'ROLE_CHANGED', entity_type: 'user', entity_id: userId, metadata: { role } });
}

export async function adminBlockUser(userId: string, isBlocked: boolean, actorId?: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_blocked: isBlocked }).eq('id', userId);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED', entity_type: 'user', entity_id: userId });
}

export async function adminVerifyUser(userId: string, isVerified: boolean, actorId?: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ is_verified: isVerified }).eq('id', userId);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'USER_VERIFIED', entity_type: 'user', entity_id: userId, metadata: { is_verified: isVerified } });
}

// ============================================================
// AGENTS & AGENCIES
// ============================================================
export async function adminGetAgents(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['AGENT', 'AGENCY'])
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Profile[];
}

// ============================================================
// LEADS / CRM
// ============================================================
export async function adminGetLeads(stage?: string): Promise<Lead[]> {
  let q = supabase
    .from('leads')
    .select(`
      *,
      property:properties(*),
      agent:profiles!leads_agent_id_fkey(*)
    `)
    .order('created_at', { ascending: false });
  if (stage && stage !== 'ALL') q = q.eq('stage', stage);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as Lead[];
}

export async function adminUpdateLeadStage(id: string, stage: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('leads').update({ stage, last_activity_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'LEAD_STAGE_CHANGED', entity_type: 'lead', entity_id: id, metadata: { stage } });
}

export async function adminAssignLead(id: string, agentId: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('leads').update({ agent_id: agentId, last_activity_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'LEAD_ASSIGNED', entity_type: 'lead', entity_id: id, metadata: { agent_id: agentId } });
}

export async function adminGetCrmStages(): Promise<CrmStage[]> {
  const { data, error } = await supabase.from('crm_stages').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as CrmStage[];
}

export async function adminGetLeadActivities(leadId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Activity[];
}

export async function adminAddLeadActivity(leadId: string, actorId: string, type: string, description: string): Promise<void> {
  await supabase.from('activities').insert({ lead_id: leadId, actor_id: actorId, type, description });
  await supabase.from('leads').update({ last_activity_at: new Date().toISOString() }).eq('id', leadId);
}

// ============================================================
// VIEWINGS
// ============================================================
export async function adminGetAllViewings(): Promise<ViewingRequest[]> {
  const { data, error } = await supabase
    .from('viewing_requests')
    .select(`
      *,
      property:properties(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ViewingRequest[];
}

// ============================================================
// MESSAGES
// ============================================================
export async function adminGetAllConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Conversation[];
}

// ============================================================
// PAYMENTS
// ============================================================
export async function adminGetAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      property:properties(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Payment[];
}

export async function adminUpdatePaymentStatus(id: string, status: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('payments').update({ status }).eq('id', id);
  if (error) throw error;
  const actionMap: Record<string, string> = {
    COMPLETED: 'PAYMENT_APPROVED',
    REFUNDED: 'PAYMENT_REFUNDED',
    FAILED: 'PAYMENT_FAILED',
    CANCELLED: 'PAYMENT_CANCELLED',
  };
  await createAuditLog({ actor_id: actorId, action: actionMap[status] || 'PAYMENT_UPDATED', entity_type: 'payment', entity_id: id });
}

// ============================================================
// SERVICE PROVIDERS & REQUESTS
// ============================================================
export async function adminGetServiceProviders(): Promise<ServiceProvider[]> {
  const { data, error } = await supabase.from('service_providers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ServiceProvider[];
}

export async function adminApproveServiceProvider(id: string, approved: boolean, actorId?: string): Promise<void> {
  const { error } = await supabase.from('service_providers').update({ is_approved: approved }).eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: approved ? 'SERVICE_PROVIDER_APPROVED' : 'SERVICE_PROVIDER_REJECTED', entity_type: 'service_provider', entity_id: id });
}

export async function adminSuspendServiceProvider(id: string, suspended: boolean, actorId?: string): Promise<void> {
  const { error } = await supabase.from('service_providers').update({ is_suspended: suspended }).eq('id', id);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: suspended ? 'SERVICE_PROVIDER_SUSPENDED' : 'SERVICE_PROVIDER_REINSTATED', entity_type: 'service_provider', entity_id: id });
}

export async function adminGetServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as ServiceRequest[];
}

// ============================================================
// CAMPAIGNS & BANNERS
// ============================================================
export async function adminGetCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Campaign[];
}

export async function adminCreateCampaign(input: Partial<Campaign>): Promise<Campaign> {
  const { data, error } = await supabase.from('campaigns').insert(input).select().single();
  if (error) throw error;
  return data as unknown as Campaign;
}

export async function adminUpdateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
  const { error } = await supabase.from('campaigns').update(updates).eq('id', id);
  if (error) throw error;
}

export async function adminGetBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Banner[];
}

export async function adminToggleBanner(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('banners').update({ is_active: active }).eq('id', id);
  if (error) throw error;
}

// ============================================================
// SUBSCRIPTIONS & PLANS
// ============================================================
export async function adminGetPlans(): Promise<Plan[]> {
  const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as Plan[];
}

export async function adminGetSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:plans(*),
      user:profiles!subscriptions_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as Subscription[];
}

// ============================================================
// SETTINGS
// ============================================================
export async function adminGetSettings(category?: string): Promise<Setting[]> {
  let q = supabase.from('settings').select('*').order('category', { ascending: true });
  if (category) q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as Setting[];
}

export async function adminUpdateSetting(key: string, value: string, actorId?: string): Promise<void> {
  const { error } = await supabase.from('settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
  if (error) throw error;
  await createAuditLog({ actor_id: actorId, action: 'SETTINGS_UPDATED', entity_type: 'setting', metadata: { key, value } });
}

// ============================================================
// LEGAL DOCUMENTS
// ============================================================
export async function adminGetLegalDocuments(type?: string): Promise<LegalDocument[]> {
  let q = supabase.from('legal_documents').select('*').order('updated_at', { ascending: false });
  if (type) q = q.eq('type', type);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as LegalDocument[];
}

export async function adminUpdateLegalDocument(id: string, content: string, title: string, actorId?: string): Promise<void> {
  // Get current version
  const { data: current } = await supabase.from('legal_documents').select('*').eq('id', id).maybeSingle();
  if (!current) return;

  // Deactivate old version
  await supabase.from('legal_documents').update({ is_active: false }).eq('id', id);

  // Create new version
  const currentDoc = current as { type?: string; version?: number } | null;
  await supabase.from('legal_documents').insert({
    type: currentDoc?.type || '',
    title,
    content,
    version: (currentDoc?.version || 1) + 1,
    is_active: true,
    updated_by: actorId || null,
  });

  await createAuditLog({ actor_id: actorId, action: 'LEGAL_DOCUMENT_UPDATED', entity_type: 'legal_document', entity_id: id });
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export async function adminGetNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data || []) as unknown as Notification[];
}

export async function adminMarkNotificationRead(id: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function adminCreateNotification(userId: string, title: string, message: string, type: string = 'INFO', link?: string): Promise<void> {
  await supabase.from('notifications').insert({ user_id: userId, title, message, type, link });
}

// ============================================================
// AUDIT LOGS
// ============================================================
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

export async function adminGetAuditLogs(limit = 100, actionFilter?: string): Promise<AuditLog[]> {
  let q = supabase
    .from('audit_logs')
    .select(`
      *,
      actor:profiles!audit_logs_actor_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (actionFilter) q = q.eq('action', actionFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as AuditLog[];
}

// ============================================================
// ANALYTICS
// ============================================================
export interface AnalyticsData {
  usersByMonth: { month: string; count: number }[];
  propertiesByStatus: { status: string; count: number }[];
  viewsByMonth: { month: string; count: number }[];
  topAgents: { agent: Profile; properties: number; views: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  type PropRow = { view_count?: number; owner_id?: string; property_status?: string; created_at?: string };
  type UserRow = { created_at?: string };
  type PayRow = { amount?: number; created_at?: string };
  type AgentRow = { id: string; full_name?: string; email?: string };

  // Total views
  const { data: propData } = await supabase.from('properties').select('view_count, owner_id, property_status, created_at');
  const totalViews = (propData || []).reduce((sum: number, p: PropRow) => sum + (p.view_count || 0), 0);

  // Total favorites
  const { count: totalFavorites } = await supabase.from('favorites').select('*', { count: 'exact', head: true });

  // Total messages
  const { count: totalMessages } = await supabase.from('messages').select('*', { count: 'exact', head: true });

  // Properties by status
  const statusCounts: Record<string, number> = {};
  (propData || []).forEach((p: PropRow) => {
    const s = p.property_status || 'UNKNOWN';
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });

  // Users by month (last 6 months)
  const { data: userData } = await supabase.from('profiles').select('created_at');
  const usersByMonth: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
    usersByMonth[key] = 0;
  }
  (userData || []).forEach((u: UserRow) => {
    if (!u.created_at) return;
    const d = new Date(u.created_at);
    const key = d.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
    if (key in usersByMonth) usersByMonth[key]++;
  });

  // Views by month (approx from property created_at)
  const viewsByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
    viewsByMonth[key] = 0;
  }
  (propData || []).forEach((p: PropRow) => {
    const d = new Date(p.created_at || '');
    const key = d.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
    if (key in viewsByMonth) viewsByMonth[key] += p.view_count || 0;
  });

  // Revenue by month
  const { data: payData } = await supabase.from('payments').select('amount, currency, created_at, status').eq('status', 'COMPLETED');
  const revenueByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
    revenueByMonth[key] = 0;
  }
  (payData || []).forEach((p: PayRow) => {
    const d = new Date(p.created_at || '');
    const key = d.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
    if (key in revenueByMonth) revenueByMonth[key] += Number(p.amount || 0);
  });

  // Top agents
  const agentStats: Record<string, { properties: number; views: number }> = {};
  (propData || []).forEach((p: PropRow) => {
    const id = p.owner_id || '';
    if (!agentStats[id]) agentStats[id] = { properties: 0, views: 0 };
    agentStats[id].properties++;
    agentStats[id].views += p.view_count || 0;
  });
  const topAgentIds = Object.entries(agentStats)
    .sort((a, b) => b[1].views - a[1].views)
    .slice(0, 5)
    .map(([id]) => id);
  const { data: agentProfiles } = await supabase.from('profiles').select('*').in('id', topAgentIds);
  const topAgents = (agentProfiles || []).map((a: AgentRow) => ({
    agent: a as unknown as Profile,
    properties: agentStats[a.id]?.properties || 0,
    views: agentStats[a.id]?.views || 0,
  }));

  return {
    usersByMonth: Object.entries(usersByMonth).map(([month, count]) => ({ month, count })),
    propertiesByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    viewsByMonth: Object.entries(viewsByMonth).map(([month, count]) => ({ month, count })),
    topAgents,
    revenueByMonth: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
    totalViews,
    totalFavorites: totalFavorites || 0,
    totalMessages: totalMessages || 0,
  };
}
