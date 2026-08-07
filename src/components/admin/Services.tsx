import type { ServiceProvider, ServiceRequest } from '@/services/adminService';
import { CheckCircle2, Ban, Star, Wrench, Clock } from 'lucide-react';
import { useState } from 'react';

interface Props {
  providers: ServiceProvider[];
  requests: ServiceRequest[];
  onApprove: (id: string, approved: boolean) => void;
  onSuspend: (id: string, suspended: boolean) => void;
}

const SERVICE_CATEGORIES = [
  'Mudanças', 'Limpeza', 'Manutenção', 'Decoração', 'Pintura',
  'Eletricidade', 'Canalização', 'Jardinagem', 'Segurança', 'Outros',
];

export function Services({ providers, requests, onApprove, onSuspend }: Props) {
  const [tab, setTab] = useState<'providers' | 'requests'>('providers');
  const [filter, setFilter] = useState('ALL');

  const filteredProviders = filter === 'ALL' ? providers : providers.filter((p) => p.category === filter);
  const filteredRequests = filter === 'ALL' ? requests : requests.filter((r) => r.category === filter);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('providers')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'providers' ? 'bg-okapika-600 text-white' : 'bg-white text-baobab-600 border border-baobab-200'}`}>
          Prestadores ({providers.length})
        </button>
        <button onClick={() => setTab('requests')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'requests' ? 'bg-okapika-600 text-white' : 'bg-white text-baobab-600 border border-baobab-200'}`}>
          Pedidos ({requests.length})
        </button>
      </div>

      {/* Category filter */}
      <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input text-sm w-48">
        <option value="ALL">Todas as categorias</option>
        {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      {tab === 'providers' && (
        <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-baobab-50 border-b border-baobab-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Empresa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Contacto</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Avaliação</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-baobab-50">
              {filteredProviders.map((p) => (
                <tr key={p.id} className="hover:bg-baobab-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-earth-800 text-sm">{p.company_name}</div>
                    {p.province && <div className="text-xs text-baobab-400">{p.province}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-sm text-baobab-600">{p.category}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {p.phone && <div className="text-xs text-baobab-600">{p.phone}</div>}
                    {p.email && <div className="text-xs text-baobab-400">{p.email}</div>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-acacia-500 fill-acacia-500" /> {p.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.is_suspended ? <span className="badge bg-okapika-50 text-okapika-700 border-okapika-200">Suspenso</span> :
                     p.is_approved ? <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200">Aprovado</span> :
                     <span className="badge bg-acacia-50 text-acacia-700 border-acacia-200">Pendente</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!p.is_approved && !p.is_suspended && (
                        <button onClick={() => onApprove(p.id, true)} className="p-1.5 rounded text-savanna-600 hover:bg-savanna-50" title="Aprovar">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {p.is_approved && !p.is_suspended && (
                        <button onClick={() => onSuspend(p.id, true)} className="p-1.5 rounded text-okapika-600 hover:bg-okapika-50" title="Suspender">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {p.is_suspended && (
                        <button onClick={() => onSuspend(p.id, false)} className="p-1.5 rounded text-savanna-600 hover:bg-savanna-50" title="Reativar">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProviders.length === 0 && <div className="p-12 text-center"><Wrench className="w-12 h-12 text-baobab-300 mx-auto mb-3" /><p className="text-baobab-500">Sem prestadores de serviço.</p></div>}
        </div>
      )}

      {tab === 'requests' && (
        <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
          <div className="divide-y divide-baobab-50">
            {filteredRequests.map((r) => (
              <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-baobab-50">
                <div className="w-10 h-10 rounded-lg bg-acacia-50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-acacia-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-earth-800">{r.category}</div>
                  <div className="text-xs text-baobab-500 truncate">{r.description}</div>
                  {r.scheduled_date && <div className="text-xs text-baobab-400 mt-0.5">Agendado: {new Date(r.scheduled_date).toLocaleDateString('pt-AO')}</div>}
                </div>
                <span className={`badge ${
                  r.status === 'COMPLETED' ? 'bg-savanna-50 text-savanna-700 border-savanna-200' :
                  r.status === 'PENDING' ? 'bg-acacia-50 text-acacia-700 border-acacia-200' :
                  'bg-baobab-100 text-baobab-600 border-baobab-200'
                }`}>{r.status}</span>
                {r.price && <span className="text-sm font-medium text-earth-700">{r.price} Kz</span>}
              </div>
            ))}
          </div>
          {filteredRequests.length === 0 && <div className="p-12 text-center"><p className="text-baobab-500">Sem pedidos de serviço.</p></div>}
        </div>
      )}
    </div>
  );
}
