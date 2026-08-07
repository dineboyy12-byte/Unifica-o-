import { useState } from 'react';
import type { Property } from '@/types';
import {
  Eye, CheckCircle2, XCircle, AlertCircle, Star, Ban, Archive,
  Search, ChevronDown, ChevronUp, Home, MapPin,
} from 'lucide-react';
import { Link } from '@/context/RouterContext';
import {
  PUBLICATION_STATUS_LABELS, PUBLICATION_STATUS_COLORS,
  PROPERTY_STATUS_LABELS, formatPrice,
} from '@/lib/constants';

interface Props {
  properties: Property[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onSuspend: (id: string) => void;
  onArchive: (id: string) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  onTogglePromoted: (id: string, promoted: boolean) => void;
  onBulkApprove: (ids: string[]) => void;
  onBulkSuspend: (ids: string[]) => void;
}

export function PropertyManagement({
  properties, onApprove, onReject, onRequestChanges, onSuspend, onArchive,
  onToggleFeatured, onTogglePromoted, onBulkApprove, onBulkSuspend,
}: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = properties.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.owner?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.publication_status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return sortAsc ? cmp : -cmp;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="bg-okapika-50 border border-okapika-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-okapika-800">{selected.size} selecionado(s)</span>
          <button onClick={() => { onBulkApprove([...selected]); setSelected(new Set()); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-savanna-600 text-white hover:bg-savanna-700">
            Aprovar todos
          </button>
          <button onClick={() => { onBulkSuspend([...selected]); setSelected(new Set()); }} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-okapika-600 text-white hover:bg-okapika-700">
            Suspender todos
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-baobab-500 hover:underline ml-auto">Cancelar</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-baobab-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar imóveis..." className="input pl-9 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input text-sm w-48">
          <option value="ALL">Todos os estados</option>
          {Object.entries(PUBLICATION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => setSortAsc(!sortAsc)} className="btn-outline text-sm">
          {sortAsc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Data
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-baobab-50 border-b border-baobab-100">
            <tr>
              <th className="px-3 py-3 w-8">
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-baobab-600 uppercase">Imóvel</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Proprietário</th>
              <th className="text-left px-3 py-3 text-xs font-semibold text-baobab-600 uppercase hidden lg:table-cell">Localização</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Preço</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-baobab-600 uppercase">Estado</th>
              <th className="text-right px-3 py-3 text-xs font-semibold text-baobab-600 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-baobab-50">
            {filtered.map((p) => (
              <>
                <tr key={p.id} className="hover:bg-baobab-50">
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-baobab-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <Home className="w-5 h-5 text-baobab-400" />}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/property/${p.slug}`} className="text-sm font-medium text-earth-800 hover:text-okapika-700 line-clamp-1">{p.title}</Link>
                        <div className="text-xs text-baobab-400">{new Date(p.created_at).toLocaleDateString('pt-AO')}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 hidden md:table-cell">
                    <div className="text-sm text-earth-700">{p.owner?.full_name || '—'}</div>
                    <div className="text-xs text-baobab-400">{p.owner?.email}</div>
                  </td>
                  <td className="px-3 py-3 hidden lg:table-cell">
                    <span className="text-sm text-baobab-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {p.province}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right hidden md:table-cell">
                    <span className="text-sm font-medium text-earth-700">{formatPrice(p.price, p.currency)}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`badge ${PUBLICATION_STATUS_COLORS[p.publication_status]}`}>{PUBLICATION_STATUS_LABELS[p.publication_status]}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/property/${p.slug}`} className="p-1.5 rounded text-baobab-500 hover:bg-baobab-100" title="Ver">
                        <Eye className="w-4 h-4" />
                      </Link>
                      {p.publication_status === 'PENDING_REVIEW' && (
                        <button onClick={() => onApprove(p.id)} className="p-1.5 rounded text-savanna-600 hover:bg-savanna-50" title="Aprovar">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onToggleFeatured(p.id, p.featured)} className={`p-1.5 rounded ${p.featured ? 'text-acacia-600 bg-acacia-50' : 'text-baobab-400 hover:bg-baobab-100'}`} title="Destaque">
                        <Star className={`w-4 h-4 ${p.featured ? 'fill-acacia-500' : ''}`} />
                      </button>
                      <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="p-1.5 rounded text-baobab-500 hover:bg-baobab-100" title="Mais ações">
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded === p.id ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === p.id && (
                  <tr className="bg-baobab-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => onApprove(p.id)} className="px-3 py-1.5 rounded-lg text-sm bg-savanna-600 text-white hover:bg-savanna-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> Aprovar
                        </button>
                        <button onClick={() => onReject(p.id)} className="px-3 py-1.5 rounded-lg text-sm bg-okapika-600 text-white hover:bg-okapika-700 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> Rejeitar
                        </button>
                        <button onClick={() => onRequestChanges(p.id)} className="px-3 py-1.5 rounded-lg text-sm bg-acacia-100 text-acacia-700 hover:bg-acacia-200 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> Pedir alterações
                        </button>
                        <button onClick={() => onSuspend(p.id)} className="px-3 py-1.5 rounded-lg text-sm bg-baobab-200 text-baobab-700 hover:bg-baobab-300 flex items-center gap-1.5">
                          <Ban className="w-4 h-4" /> Suspender
                        </button>
                        <button onClick={() => onArchive(p.id)} className="px-3 py-1.5 rounded-lg text-sm bg-baobab-100 text-baobab-600 hover:bg-baobab-200 flex items-center gap-1.5">
                          <Archive className="w-4 h-4" /> Arquivar
                        </button>
                        <button onClick={() => onTogglePromoted(p.id, p.promoted)} className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 ${p.promoted ? 'bg-atlantic-100 text-atlantic-700' : 'bg-baobab-100 text-baobab-600 hover:bg-baobab-200'}`}>
                          <Star className="w-4 h-4" /> {p.promoted ? 'Remover promoção' : 'Promover'}
                        </button>
                        <div className="ml-auto text-xs text-baobab-400 flex items-center">
                          {PROPERTY_STATUS_LABELS[p.property_status]} · {p.view_count} vistas
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Home className="w-12 h-12 text-baobab-300 mx-auto mb-3" />
            <p className="text-baobab-500">Nenhum imóvel encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
