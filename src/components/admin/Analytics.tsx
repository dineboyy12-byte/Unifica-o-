import type { AnalyticsData } from '@/services/adminService';
import {
  Users, Eye, Heart, MessageSquare, DollarSign, TrendingUp, Home,
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { PROPERTY_STATUS_LABELS } from '@/lib/constants';

interface Props {
  data: AnalyticsData;
}

export function Analytics({ data }: Props) {
  const summaryCards = [
    { label: 'Utilizadores', value: data.topAgents.length > 0 ? '—' : '0', icon: Users, color: 'bg-atlantic-50 text-atlantic-700', display: undefined },
    { label: 'Visualizações', value: String(data.totalViews), icon: Eye, color: 'bg-okapika-50 text-okapika-700' },
    { label: 'Favoritos', value: String(data.totalFavorites), icon: Heart, color: 'bg-okapika-50 text-okapika-700' },
    { label: 'Mensagens', value: String(data.totalMessages), icon: MessageSquare, color: 'bg-savanna-50 text-savanna-700' },
    { label: 'Receita total', value: formatPrice(data.revenueByMonth.reduce((s, m) => s + m.revenue, 0), 'AOA'), icon: DollarSign, color: 'bg-savanna-50 text-savanna-700' },
  ];

  const maxUsers = Math.max(...data.usersByMonth.map((m) => m.count), 1);
  const maxViews = Math.max(...data.viewsByMonth.map((m) => m.count), 1);
  const maxRevenue = Math.max(...data.revenueByMonth.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {summaryCards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-baobab-100 p-4">
            <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center mb-2`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-earth-800">{c.value}</div>
            <div className="text-xs text-baobab-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Users chart */}
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <h3 className="font-display text-base font-semibold text-earth-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-atlantic-600" /> Novos utilizadores
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {data.usersByMonth.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-atlantic-200 rounded-t-md transition-all hover:bg-atlantic-300" style={{ height: `${(m.count / maxUsers) * 100}%`, minHeight: '2px' }} title={`${m.count} utilizadores`} />
                <span className="text-[10px] text-baobab-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Views chart */}
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <h3 className="font-display text-base font-semibold text-earth-800 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-okapika-600" /> Visualizações
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {data.viewsByMonth.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-okapika-200 rounded-t-md transition-all hover:bg-okapika-300" style={{ height: `${(m.count / maxViews) * 100}%`, minHeight: '2px' }} title={`${m.count} vistas`} />
                <span className="text-[10px] text-baobab-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <h3 className="font-display text-base font-semibold text-earth-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-savanna-600" /> Receita
          </h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {data.revenueByMonth.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-savanna-200 rounded-t-md transition-all hover:bg-savanna-300" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: '2px' }} title={formatPrice(m.revenue, 'AOA')} />
                <span className="text-[10px] text-baobab-400">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Properties by status */}
        <div className="bg-white rounded-xl border border-baobab-100 p-5">
          <h3 className="font-display text-base font-semibold text-earth-800 mb-4 flex items-center gap-2">
            <Home className="w-4 h-4 text-earth-600" /> Imóveis por estado
          </h3>
          <div className="space-y-2">
            {data.propertiesByStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-sm text-baobab-600 w-24">{PROPERTY_STATUS_LABELS[s.status as keyof typeof PROPERTY_STATUS_LABELS] || s.status}</span>
                <div className="flex-1 bg-baobab-100 rounded-full h-6 overflow-hidden">
                  <div className="bg-earth-400 h-full rounded-full transition-all" style={{ width: `${(s.count / Math.max(...data.propertiesByStatus.map((p) => p.count), 1)) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-earth-700 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top agents */}
      <div className="bg-white rounded-xl border border-baobab-100 p-5">
        <h3 className="font-display text-base font-semibold text-earth-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-savanna-600" /> Top agentes (por visualizações)
        </h3>
        <div className="space-y-3">
          {data.topAgents.map((ta, i) => (
            <div key={ta.agent.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-baobab-400 w-6">#{i + 1}</span>
              <div className="w-9 h-9 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 text-sm font-medium">
                {ta.agent.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-earth-800 truncate">{ta.agent.full_name || ta.agent.email}</div>
                <div className="text-xs text-baobab-500">{ta.properties} imóveis · {ta.views} vistas</div>
              </div>
            </div>
          ))}
          {data.topAgents.length === 0 && <p className="text-sm text-baobab-400 text-center py-4">Sem dados de agentes ainda.</p>}
        </div>
      </div>
    </div>
  );
}
