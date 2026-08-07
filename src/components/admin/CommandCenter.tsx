import type { AdminStats, AdminAlert } from '@/services/adminService';
import {
  Home, CheckCircle2, Clock, TrendingUp, Building2, Users, Eye,
  DollarSign, Target, Megaphone, Image as ImageIcon, Wrench,
  AlertCircle, Info, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { useRouter } from '@/context/RouterContext';

interface Props {
  stats: AdminStats;
  alerts: AdminAlert[];
}

export function CommandCenter({ stats, alerts }: Props) {
  const { navigate } = useRouter();

  const cards = [
    { label: 'Imóveis publicados', value: stats.publishedProperties, icon: CheckCircle2, color: 'bg-savanna-50 text-savanna-700' },
    { label: 'A aguardar aprovação', value: stats.pendingProperties, icon: Clock, color: 'bg-acacia-50 text-acacia-700' },
    { label: 'Imóveis vendidos', value: stats.soldProperties, icon: TrendingUp, color: 'bg-okapika-50 text-okapika-700' },
    { label: 'Imóveis arrendados', value: stats.rentedProperties, icon: Building2, color: 'bg-atlantic-50 text-atlantic-700' },
    { label: 'Total imóveis', value: stats.totalProperties, icon: Home, color: 'bg-earth-100 text-earth-700' },
    { label: 'Utilizadores', value: stats.totalUsers, icon: Users, color: 'bg-baobab-100 text-baobab-700' },
    { label: 'Novos este mês', value: stats.newUsersThisMonth, icon: Users, color: 'bg-baobab-100 text-baobab-700' },
    { label: 'Novos leads', value: stats.newLeads, icon: Target, color: 'bg-okapika-50 text-okapika-700' },
    { label: 'Visitas agendadas', value: stats.scheduledViewings, icon: Eye, color: 'bg-acacia-50 text-acacia-700' },
    { label: 'Receita (Kz)', value: formatNumber(stats.totalRevenue), icon: DollarSign, color: 'bg-savanna-50 text-savanna-700' },
    { label: 'Campanhas ativas', value: stats.activeCampaigns, icon: Megaphone, color: 'bg-atlantic-50 text-atlantic-700' },
    { label: 'Publicidade', value: stats.activeBanners, icon: ImageIcon, color: 'bg-earth-100 text-earth-700' },
    { label: 'Serviços pendentes', value: stats.pendingServiceRequests, icon: Wrench, color: 'bg-acacia-50 text-acacia-700' },
    { label: 'Taxa de conversão', value: `${stats.conversionRate}%`, icon: TrendingUp, color: 'bg-savanna-50 text-savanna-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <h2 className="font-display text-lg font-semibold text-earth-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-acacia-600" />
            Centro de Alertas
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => navigate(alert.link)}
                className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:opacity-80 ${
                  alert.severity === 'danger' ? 'bg-okapika-50 border border-okapika-200' :
                  alert.severity === 'warning' ? 'bg-acacia-50 border border-acacia-200' :
                  'bg-atlantic-50 border border-atlantic-200'
                }`}
              >
                {alert.severity === 'danger' ? <AlertTriangle className="w-5 h-5 text-okapika-600 shrink-0" /> :
                 alert.severity === 'warning' ? <AlertCircle className="w-5 h-5 text-acacia-600 shrink-0" /> :
                 <Info className="w-5 h-5 text-atlantic-600 shrink-0" />}
                <span className={`text-sm font-medium flex-1 ${
                  alert.severity === 'danger' ? 'text-okapika-800' :
                  alert.severity === 'warning' ? 'text-acacia-800' :
                  'text-atlantic-800'
                }`}>{alert.message}</span>
                <ArrowRight className="w-4 h-4 text-baobab-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-baobab-100 p-4">
            <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-earth-800">{c.value}</div>
            <div className="text-xs text-baobab-500 leading-tight mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}
