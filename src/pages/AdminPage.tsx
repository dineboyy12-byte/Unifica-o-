import { useEffect, useState, useCallback } from 'react';
import { useRouter, Link } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import type { Profile, AuditLog, Property, Payment, Conversation, ViewingRequest, Notification } from '@/types';
import type {
  AdminStats, AdminAlert, Lead, CrmStage, Activity,
  ServiceProvider, ServiceRequest, Campaign, Banner,
  Setting, LegalDocument, AnalyticsData,
} from '@/services/adminService';
import * as adminService from '@/services/adminService';

import { LayoutDashboard, Chrome as Home, Clock, Users, UserCog, Building2, Target, TrendingUp, Calendar, MessageSquare, DollarSign, FileText, Wrench, Megaphone, CreditCard, ChartBar as BarChart3, Bell, Settings as SettingsIcon, Shield, Loader as Loader2, Search, Menu, X, Building } from 'lucide-react';

import { CommandCenter } from '@/components/admin/CommandCenter';
import { PropertyManagement } from '@/components/admin/PropertyManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { CrmPipeline } from '@/components/admin/CrmPipeline';
import { Analytics } from '@/components/admin/Analytics';
import { Finance } from '@/components/admin/Finance';
import { Marketing } from '@/components/admin/Marketing';
import { Services } from '@/components/admin/Services';
import { Settings } from '@/components/admin/Settings';
import {
  AgentsAgencies, LeadsList, ViewingsList, MessagesList,
  Subscriptions, Notifications, AuditLogs,
} from '@/components/admin/AdminSections';

type AdminTab =
  | 'overview' | 'properties' | 'pending' | 'users' | 'agents' | 'agencies'
  | 'leads' | 'crm' | 'viewings' | 'messages' | 'payments' | 'analytics'
  | 'services' | 'marketing' | 'subscriptions' | 'notifications'
  | 'settings' | 'audit';

interface SidebarItem {
  id: AdminTab;
  label: string;
  icon: typeof Home;
  badge?: number;
  group?: string;
}

export function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const { route, navigate } = useRouter();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [agents, setAgents] = useState<Profile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [crmStages, setCrmStages] = useState<CrmStage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [subscriptions, setSubscriptions] = useState<import('@/types').Subscription[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Sync tab from URL param
  useEffect(() => {
    if (route.params.tab) {
      setTab(route.params.tab as AdminTab);
    }
  }, [route.params]);

  // Auth guard
  useEffect(() => {
    if (!authLoading) {
      if (!profile) {
        navigate('/auth');
        return;
      }
      if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
        navigate('/dashboard');
        return;
      }
      loadInitialData();
    }
  }, [profile, authLoading, navigate]);

  const loadInitialData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [s, a, props, pending, userList, agentList, auditLogsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getAdminAlerts(),
        adminService.adminGetAllProperties({ limit: 100 }),
        adminService.adminGetAllProperties({ status: 'PENDING_REVIEW' }),
        adminService.adminGetAllProfiles(),
        adminService.adminGetAgents(),
        adminService.adminGetAuditLogs(100),
      ]);
      setStats(s);
      setAlerts(a);
      setAllProperties(props);
      setPendingProperties(pending);
      setUsers(userList);
      setAgents(agentList);
      setAuditLogs(auditLogsData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Lazy-load tab-specific data
  const loadTabData = useCallback(async (tab: AdminTab) => {
    if (!profile) return;
    try {
      switch (tab) {
        case 'leads':
        case 'crm': {
          const [l, st] = await Promise.all([
            adminService.adminGetLeads(),
            adminService.adminGetCrmStages(),
          ]);
          setLeads(l);
          setCrmStages(st);
          setActivities([]);
          break;
        }
        case 'viewings': {
          const v = await adminService.adminGetAllViewings();
          setViewings(v);
          break;
        }
        case 'messages': {
          const c = await adminService.adminGetAllConversations();
          setConversations(c);
          break;
        }
        case 'payments': {
          const p = await adminService.adminGetAllPayments();
          setPayments(p);
          break;
        }
        case 'analytics': {
          const d = await adminService.getAnalyticsData();
          setAnalyticsData(d);
          break;
        }
        case 'services': {
          const [sp, sr] = await Promise.all([
            adminService.adminGetServiceProviders(),
            adminService.adminGetServiceRequests(),
          ]);
          setServiceProviders(sp);
          setServiceRequests(sr);
          break;
        }
        case 'marketing': {
          const [c, b] = await Promise.all([
            adminService.adminGetCampaigns(),
            adminService.adminGetBanners(),
          ]);
          setCampaigns(c);
          setBanners(b);
          break;
        }
        case 'subscriptions': {
          const subs = await adminService.adminGetSubscriptions();
          setSubscriptions(subs);
          break;
        }
        case 'settings': {
          const [s, ld] = await Promise.all([
            adminService.adminGetSettings(),
            adminService.adminGetLegalDocuments(),
          ]);
          setSettings(s);
          setLegalDocs(ld);
          break;
        }
        case 'notifications': {
          if (profile) {
            const n = await adminService.adminGetNotifications(profile.id);
            setNotifications(n);
          }
          break;
        }
      }
    } catch {
      // ignore
    }
  }, [profile]);

  useEffect(() => {
    if (profile && (profile.role === 'ADMIN' || profile.role === 'SUPER_ADMIN') && !loading) {
      loadTabData(tab);
    }
  }, [tab, profile, loading, loadTabData]);

  // Admin actions
  const handleApprove = async (id: string) => {
    await adminService.adminUpdatePublicationStatus(id, 'PUBLISHED', profile?.id);
    loadInitialData();
  };
  const handleReject = async (id: string) => {
    await adminService.adminUpdatePublicationStatus(id, 'REJECTED', profile?.id);
    loadInitialData();
  };
  const handleRequestChanges = async (id: string) => {
    await adminService.adminUpdatePublicationStatus(id, 'CHANGES_REQUESTED', profile?.id);
    loadInitialData();
  };
  const handleSuspend = async (id: string) => {
    await adminService.adminUpdatePublicationStatus(id, 'SUSPENDED', profile?.id);
    loadInitialData();
  };
  const handleArchive = async (id: string) => {
    await adminService.adminUpdatePublicationStatus(id, 'ARCHIVED', profile?.id);
    loadInitialData();
  };
  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await adminService.adminToggleFeatured(id, !featured, profile?.id);
    loadInitialData();
  };
  const handleTogglePromoted = async (id: string, promoted: boolean) => {
    await adminService.adminTogglePromoted(id, !promoted);
    loadInitialData();
  };
  const handleBulkApprove = async (ids: string[]) => {
    await adminService.adminBulkApprove(ids, profile?.id);
    loadInitialData();
  };
  const handleBulkSuspend = async (ids: string[]) => {
    await adminService.adminBulkSuspend(ids, profile?.id);
    loadInitialData();
  };
  const handleRoleChange = async (userId: string, role: string) => {
    await adminService.adminUpdateUserRole(userId, role, profile?.id);
    loadInitialData();
  };
  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    await adminService.adminBlockUser(userId, isBlocked, profile?.id);
    loadInitialData();
  };
  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    await adminService.adminVerifyUser(userId, isVerified, profile?.id);
    loadInitialData();
  };
  const handleUpdateLeadStage = async (id: string, stage: string) => {
    await adminService.adminUpdateLeadStage(id, stage, profile?.id);
    loadTabData('leads');
  };
  const handleAddActivity = async (leadId: string, type: string, desc: string) => {
    if (!profile) return;
    await adminService.adminAddLeadActivity(leadId, profile.id, type, desc);
    const acts = await adminService.adminGetLeadActivities(leadId);
    setActivities(acts);
  };
  const handleUpdatePaymentStatus = async (id: string, status: string) => {
    await adminService.adminUpdatePaymentStatus(id, status, profile?.id);
    loadTabData('payments');
  };
  const handleApproveProvider = async (id: string, approved: boolean) => {
    await adminService.adminApproveServiceProvider(id, approved, profile?.id);
    loadTabData('services');
  };
  const handleSuspendProvider = async (id: string, suspended: boolean) => {
    await adminService.adminSuspendServiceProvider(id, suspended, profile?.id);
    loadTabData('services');
  };
  const handleCreateCampaign = async (input: Partial<Campaign>) => {
    await adminService.adminCreateCampaign(input);
    loadTabData('marketing');
  };
  const handleUpdateCampaign = async (id: string, updates: Partial<Campaign>) => {
    await adminService.adminUpdateCampaign(id, updates);
    loadTabData('marketing');
  };
  const handleToggleBanner = async (id: string, active: boolean) => {
    await adminService.adminToggleBanner(id, active);
    loadTabData('marketing');
  };
  const handleUpdateSetting = async (key: string, value: string) => {
    await adminService.adminUpdateSetting(key, value, profile?.id);
    loadTabData('settings');
  };
  const handleUpdateLegalDoc = async (id: string, content: string, title: string) => {
    await adminService.adminUpdateLegalDocument(id, content, title, profile?.id);
    loadTabData('settings');
  };
  const handleMarkNotificationRead = async (id: string) => {
    await adminService.adminMarkNotificationRead(id);
    loadTabData('notifications');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-baobab-50">
        <Loader2 className="w-8 h-8 text-okapika-600 animate-spin mb-4" />
        <p className="text-baobab-500">A carregar painel administrativo...</p>
      </div>
    );
  }

  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN')) return null;

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard, group: 'Principal' },
    { id: 'properties', label: 'Imóveis', icon: Home, group: 'Imóveis' },
    { id: 'pending', label: 'Moderação', icon: Clock, badge: pendingProperties.length, group: 'Imóveis' },
    { id: 'users', label: 'Utilizadores', icon: Users, group: 'Pessoas' },
    { id: 'agents', label: 'Agentes', icon: UserCog, group: 'Pessoas' },
    { id: 'agencies', label: 'Agências', icon: Building2, group: 'Pessoas' },
    { id: 'leads', label: 'Leads', icon: Target, group: 'Vendas' },
    { id: 'crm', label: 'CRM Pipeline', icon: TrendingUp, group: 'Vendas' },
    { id: 'viewings', label: 'Visitas', icon: Calendar, group: 'Vendas' },
    { id: 'messages', label: 'Mensagens', icon: MessageSquare, group: 'Vendas' },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign, group: 'Financeiro' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'Financeiro' },
    { id: 'services', label: 'Serviços', icon: Wrench, group: 'Operações' },
    { id: 'marketing', label: 'Marketing', icon: Megaphone, group: 'Operações' },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, group: 'Operações' },
    { id: 'notifications', label: 'Notificações', icon: Bell, group: 'Sistema' },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon, group: 'Sistema' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, group: 'Sistema' },
  ];

  const groupedItems = sidebarItems.reduce((acc, item) => {
    const g = item.group || 'Outros';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  const handleTabChange = (newTab: AdminTab) => {
    setTab(newTab);
    setSidebarOpen(false);
    navigate(`/admin?tab=${newTab}`);
  };

  const tabTitle = sidebarItems.find((i) => i.id === tab)?.label || 'Admin';

  return (
    <div className="min-h-screen bg-baobab-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 lg:z-auto
        w-64 h-screen bg-earth-900 text-earth-100 flex flex-col shrink-0
        transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-earth-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-okapika-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display text-base font-bold text-white">KUBATA KIÉ</div>
              <div className="text-[10px] text-earth-400 tracking-wider">ADMIN PORTAL</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-earth-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-3">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group}>
              <div className="text-[10px] font-semibold text-earth-500 uppercase tracking-wider px-3 mb-1">{group}</div>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tab === item.id ? 'bg-okapika-600 text-white' : 'text-earth-300 hover:bg-earth-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="bg-acacia-500 text-white text-xs rounded-full px-1.5 py-0.5">{item.badge}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-earth-800">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-earth-300 hover:bg-earth-800">
            <Building className="w-4 h-4" /> Voltar ao site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto w-full">
        {/* Header */}
        <header className="bg-white border-b border-baobab-100 px-4 lg:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-baobab-600 hover:bg-baobab-100">
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-lg font-bold text-earth-800 truncate">{tabTitle}</h1>
                <p className="text-xs text-baobab-500 hidden sm:block">{profile.full_name} · {profile.role}</p>
              </div>
            </div>
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-baobab-400" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Pesquisa global..."
                className="input pl-9 text-sm w-40 sm:w-64"
              />
            </div>
          </div>
        </header>

        {/* Content area */}
        <div className="p-4 lg:p-6">
          {tab === 'overview' && stats && <CommandCenter stats={stats} alerts={alerts} />}
          {tab === 'pending' && (
            <PropertyManagement
              properties={pendingProperties}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onSuspend={handleSuspend}
              onArchive={handleArchive}
              onToggleFeatured={handleToggleFeatured}
              onTogglePromoted={handleTogglePromoted}
              onBulkApprove={handleBulkApprove}
              onBulkSuspend={handleBulkSuspend}
            />
          )}
          {tab === 'properties' && (
            <PropertyManagement
              properties={allProperties}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
              onSuspend={handleSuspend}
              onArchive={handleArchive}
              onToggleFeatured={handleToggleFeatured}
              onTogglePromoted={handleTogglePromoted}
              onBulkApprove={handleBulkApprove}
              onBulkSuspend={handleBulkSuspend}
            />
          )}
          {tab === 'users' && (
            <UserManagement
              users={users}
              currentUserId={profile.id}
              onRoleChange={handleRoleChange}
              onBlockUser={handleBlockUser}
              onVerifyUser={handleVerifyUser}
            />
          )}
          {tab === 'agents' && <AgentsAgencies agents={agents.filter((a) => a.role === 'AGENT')} />}
          {tab === 'agencies' && <AgentsAgencies agents={agents.filter((a) => a.role === 'AGENCY')} />}
          {tab === 'leads' && <LeadsList leads={leads} />}
          {tab === 'crm' && (
            <CrmPipeline
              leads={leads}
              stages={crmStages}
              onUpdateStage={handleUpdateLeadStage}
              onAddActivity={handleAddActivity}
              activities={activities}
            />
          )}
          {tab === 'viewings' && <ViewingsList viewings={viewings} />}
          {tab === 'messages' && <MessagesList conversations={conversations} />}
          {tab === 'payments' && <Finance payments={payments} onUpdateStatus={handleUpdatePaymentStatus} />}
          {tab === 'analytics' && analyticsData && <Analytics data={analyticsData} />}
          {tab === 'services' && (
            <Services
              providers={serviceProviders}
              requests={serviceRequests}
              onApprove={handleApproveProvider}
              onSuspend={handleSuspendProvider}
            />
          )}
          {tab === 'marketing' && (
            <Marketing
              campaigns={campaigns}
              banners={banners}
              onCreateCampaign={handleCreateCampaign}
              onUpdateCampaign={handleUpdateCampaign}
              onToggleBanner={handleToggleBanner}
            />
          )}
          {tab === 'subscriptions' && <Subscriptions subscriptions={subscriptions} />}
          {tab === 'notifications' && <Notifications notifications={notifications} onMarkRead={handleMarkNotificationRead} />}
          {tab === 'settings' && (
            <Settings
              settings={settings}
              legalDocs={legalDocs}
              onUpdateSetting={handleUpdateSetting}
              onUpdateLegalDoc={handleUpdateLegalDoc}
            />
          )}
          {tab === 'audit' && <AuditLogs logs={auditLogs} />}

          {/* Empty loading state for lazy-loaded tabs */}
          {!['overview', 'pending', 'properties', 'users'].includes(tab) && loading && (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="w-6 h-6 text-okapika-600 animate-spin mb-2" />
              <p className="text-sm text-baobab-500">A carregar...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
