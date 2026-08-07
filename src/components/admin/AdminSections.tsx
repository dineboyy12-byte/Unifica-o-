import type { Profile, AuditLog, ViewingRequest, Conversation, Subscription, Notification } from '@/types';
import type { Lead } from '@/services/adminService';
import { Phone, Mail, MapPin, Home, Target, CheckCircle2, Clock, MessageSquare, Bell, FileText } from 'lucide-react';
import { Link } from '@/context/RouterContext';
import { VIEWING_STATUS_LABELS, formatPrice } from '@/lib/constants';
import { useState } from 'react';

// ============================================================
// AGENTS & AGENCIES
// ============================================================
export function AgentsAgencies({ agents }: { agents: Profile[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((a) => (
        <div key={a.id} className="bg-white rounded-xl border border-baobab-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 text-xl font-medium">
              {a.full_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-earth-800 truncate">{a.full_name || a.email}</div>
              <div className="text-xs text-baobab-500">{a.role === 'AGENCY' ? 'Agência' : 'Agente'}</div>
            </div>
            {a.is_verified && <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Verificado</span>}
          </div>
          <div className="space-y-1.5 text-sm">
            {a.phone && <div className="flex items-center gap-2 text-baobab-600"><Phone className="w-3.5 h-3.5" /> {a.phone}</div>}
            <div className="flex items-center gap-2 text-baobab-600"><Mail className="w-3.5 h-3.5" /> {a.email}</div>
            {a.province && <div className="flex items-center gap-2 text-baobab-600"><MapPin className="w-3.5 h-3.5" /> {a.province}</div>}
            {a.agency_name && <div className="flex items-center gap-2 text-baobab-600"><Home className="w-3.5 h-3.5" /> {a.agency_name}</div>}
            {a.agent_license && <div className="text-xs text-baobab-400">Licença: {a.agent_license}</div>}
          </div>
          <div className="text-xs text-baobab-400 mt-3 pt-3 border-t border-baobab-50">
            Membro desde {new Date(a.created_at).toLocaleDateString('pt-AO')}
          </div>
        </div>
      ))}
      {agents.length === 0 && <div className="col-span-full text-center py-12"><p className="text-baobab-500">Sem agentes ou agências registados.</p></div>}
    </div>
  );
}

// ============================================================
// LEADS LIST
// ============================================================
export function LeadsList({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL' ? leads : leads.filter((l) => l.stage === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === s ? 'bg-okapika-600 text-white' : 'bg-white text-baobab-600 border border-baobab-200'}`}>
            {s === 'ALL' ? 'Todos' : s}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-baobab-50 border-b border-baobab-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Lead</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Imóvel</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden lg:table-cell">Origem</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Última atividade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baobab-50">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-baobab-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-earth-800 text-sm">{l.name}</div>
                  <div className="text-xs text-baobab-500">{l.phone}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {l.property && <Link to={`/property/${l.property.slug}`} className="text-sm text-okapika-700 hover:underline truncate block max-w-[150px]">{l.property.title}</Link>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-baobab-600">{l.source}</span></td>
                <td className="px-4 py-3"><span className="badge bg-baobab-100 text-baobab-700 border-baobab-200">{l.stage}</span></td>
                <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-baobab-400">{new Date(l.last_activity_at).toLocaleDateString('pt-AO')}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center"><Target className="w-12 h-12 text-baobab-300 mx-auto mb-3" /><p className="text-baobab-500">Sem leads.</p></div>}
      </div>
    </div>
  );
}

// ============================================================
// VIEWINGS
// ============================================================
export function ViewingsList({ viewings }: { viewings: ViewingRequest[] }) {
  return (
    <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
      <div className="divide-y divide-baobab-50">
        {viewings.map((v) => (
          <div key={v.id} className="flex items-center gap-4 p-4 hover:bg-baobab-50">
            <div className="w-10 h-10 rounded-lg bg-acacia-50 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-acacia-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-earth-800">{new Date(v.requested_date).toLocaleDateString('pt-AO')} às {v.requested_time}</div>
              {v.property && <Link to={`/property/${v.property.slug}`} className="text-xs text-okapika-700 hover:underline">{v.property.title}</Link>}
              {v.notes && <div className="text-xs text-baobab-400 mt-0.5 truncate">{v.notes}</div>}
            </div>
            <span className="badge bg-acacia-50 text-acacia-700 border-acacia-200">{VIEWING_STATUS_LABELS[v.status]}</span>
          </div>
        ))}
      </div>
      {viewings.length === 0 && <div className="p-12 text-center"><Clock className="w-12 h-12 text-baobab-300 mx-auto mb-3" /><p className="text-baobab-500">Sem visitas agendadas.</p></div>}
    </div>
  );
}

// ============================================================
// MESSAGES (admin view)
// ============================================================
export function MessagesList({ conversations }: { conversations: Conversation[] }) {
  return (
    <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
      <div className="divide-y divide-baobab-50">
        {conversations.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-baobab-50">
            <div className="w-10 h-10 rounded-lg bg-savanna-50 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-savanna-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-earth-800">Conversa entre utilizadores</div>
              <div className="text-xs text-baobab-500">Última mensagem: {new Date(c.last_message_at).toLocaleDateString('pt-AO')}</div>
            </div>
          </div>
        ))}
      </div>
      {conversations.length === 0 && <div className="p-12 text-center"><MessageSquare className="w-12 h-12 text-baobab-300 mx-auto mb-3" /><p className="text-baobab-500">Sem conversas.</p></div>}
    </div>
  );
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================
export function Subscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
      <table className="w-full">
        <thead className="bg-baobab-50 border-b border-baobab-100">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Utilizador</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Plano</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Estado</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Início</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden lg:table-cell">Fim</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-baobab-50">
          {subscriptions.map((s) => (
            <tr key={s.id} className="hover:bg-baobab-50">
              <td className="px-4 py-3"><span className="text-sm text-earth-700">{s.user?.full_name || s.user?.email || '—'}</span></td>
              <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-baobab-600">{s.plan?.name || '—'} ({formatPrice(s.plan?.price || 0, s.plan?.currency || 'AOA')})</span></td>
              <td className="px-4 py-3"><span className={`badge ${s.status === 'ACTIVE' ? 'bg-savanna-50 text-savanna-700 border-savanna-200' : 'bg-baobab-100 text-baobab-600 border-baobab-200'}`}>{s.status}</span></td>
              <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-baobab-400">{new Date(s.start_date).toLocaleDateString('pt-AO')}</span></td>
              <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs text-baobab-400">{s.end_date ? new Date(s.end_date).toLocaleDateString('pt-AO') : '—'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      {subscriptions.length === 0 && <div className="p-12 text-center"><p className="text-baobab-500">Sem subscrições ativas.</p></div>}
    </div>
  );
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export function Notifications({ notifications, onMarkRead }: { notifications: Notification[]; onMarkRead: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
      <div className="divide-y divide-baobab-50">
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 p-4 hover:bg-baobab-50 ${!n.is_read ? 'bg-okapika-50/30' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-atlantic-50 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-atlantic-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-earth-800">{n.title}</div>
              <div className="text-xs text-baobab-500">{n.message}</div>
              <div className="text-xs text-baobab-400 mt-0.5">{new Date(n.created_at).toLocaleString('pt-AO')}</div>
            </div>
            {!n.is_read && <button onClick={() => onMarkRead(n.id)} className="text-xs text-okapika-700 hover:underline">Marcar lida</button>}
          </div>
        ))}
      </div>
      {notifications.length === 0 && <div className="p-12 text-center"><Bell className="w-12 h-12 text-baobab-300 mx-auto mb-3" /><p className="text-baobab-500">Sem notificações.</p></div>}
    </div>
  );
}

// ============================================================
// AUDIT LOGS
// ============================================================
export function AuditLogs({ logs }: { logs: AuditLog[] }) {
  const [filter, setFilter] = useState('ALL');

  const actions = [...new Set(logs.map((l) => l.action))];
  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.action === filter);

  return (
    <div className="space-y-4">
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input text-sm w-64">
        <option value="ALL">Todas as ações</option>
        {actions.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
        <div className="divide-y divide-baobab-50">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-4 py-3 hover:bg-baobab-50">
              <div className="w-9 h-9 rounded-lg bg-earth-100 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-earth-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-earth-800">{log.action}</div>
                <div className="text-xs text-baobab-500">
                  {log.actor?.full_name || log.actor?.email || 'Sistema'}
                  {log.entity_type && ` · ${log.entity_type}`}
                  {log.entity_id && ` · ${log.entity_id.slice(0, 8)}`}
                </div>
              </div>
              <div className="text-xs text-baobab-400 shrink-0">{new Date(log.created_at).toLocaleString('pt-AO')}</div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="p-12 text-center"><FileText className="w-12 h-12 text-baobab-300 mx-auto mb-3" /><p className="text-baobab-500">Sem registos de auditoria.</p></div>}
      </div>
    </div>
  );
}


