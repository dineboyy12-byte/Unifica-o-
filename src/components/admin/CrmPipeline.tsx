import { useState } from 'react';
import type { Lead, CrmStage, Activity } from '@/services/adminService';
import {
  Phone, Mail, Plus,
} from 'lucide-react';
import { Link } from '@/context/RouterContext';

interface Props {
  leads: Lead[];
  stages: CrmStage[];
  onUpdateStage: (id: string, stage: string) => void;
  onAddActivity: (leadId: string, type: string, description: string) => void;
  activities: Activity[];
}

const STAGE_COLORS: Record<string, string> = {
  baobab: 'bg-baobab-100 text-baobab-700 border-baobab-200',
  atlantic: 'bg-atlantic-50 text-atlantic-700 border-atlantic-200',
  savanna: 'bg-savanna-50 text-savanna-700 border-savanna-200',
  acacia: 'bg-acacia-50 text-acacia-700 border-acacia-200',
  okapika: 'bg-okapika-50 text-okapika-700 border-okapika-200',
  earth: 'bg-earth-100 text-earth-700 border-earth-200',
};

export function CrmPipeline({ leads, stages, onUpdateStage, onAddActivity, activities }: Props) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activityText, setActivityText] = useState('');
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');

  const handleDrop = (stageCode: string) => {
    if (draggedId) {
      onUpdateStage(draggedId, stageCode);
      setDraggedId(null);
    }
  };

  const leadActivities = selectedLead ? activities.filter((a) => a.lead_id === selectedLead.id) : [];

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('pipeline')} className="btn-outline text-sm">Ver pipeline</button>
        </div>
        <div className="bg-white rounded-xl border border-baobab-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-baobab-50 border-b border-baobab-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Imóvel</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden lg:table-cell">Agente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-baobab-600 uppercase hidden md:table-cell">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-baobab-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-baobab-50 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-earth-800 text-sm">{lead.name}</div>
                    <div className="text-xs text-baobab-500">{lead.phone}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {lead.property && <Link to={`/property/${lead.property.slug}`} className="text-sm text-okapika-700 hover:underline truncate block max-w-[150px]">{lead.property.title}</Link>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-baobab-600">{lead.agent?.full_name || 'Não atribuído'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={lead.stage}
                      onChange={(e) => { e.stopPropagation(); onUpdateStage(lead.id, e.target.value); }}
                      className="input text-sm py-1 w-32"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {stages.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-baobab-400">{new Date(lead.created_at).toLocaleDateString('pt-AO')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <div className="p-12 text-center"><p className="text-baobab-500">Sem leads.</p></div>}
        </div>
        {selectedLead && <LeadDetailDrawer lead={selectedLead} activities={leadActivities} onClose={() => setSelectedLead(null)} onAddActivity={(desc) => { onAddActivity(selectedLead.id, 'NOTE', desc); setActivityText(''); }} activityText={activityText} setActivityText={setActivityText} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-earth-800">Pipeline de Vendas</h2>
        <button onClick={() => setView('list')} className="btn-outline text-sm">Ver lista</button>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.code);
            return (
              <div
                key={stage.code}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage.code)}
                className="w-64 shrink-0"
              >
                <div className={`rounded-lg px-3 py-2 mb-2 border ${STAGE_COLORS[stage.color] || STAGE_COLORS.baobab}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{stage.name}</span>
                    <span className="text-xs font-bold opacity-70">{stageLeads.length}</span>
                  </div>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggedId(lead.id)}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white rounded-lg border border-baobab-100 p-3 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="font-medium text-sm text-earth-800 line-clamp-1">{lead.name}</div>
                      <div className="text-xs text-baobab-500 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {lead.phone}
                      </div>
                      {lead.property && (
                        <div className="text-xs text-okapika-600 mt-1 line-clamp-1">{lead.property.title}</div>
                      )}
                      <div className="text-xs text-baobab-400 mt-1">{new Date(lead.created_at).toLocaleDateString('pt-AO')}</div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-6 text-xs text-baobab-300 border-2 border-dashed border-baobab-100 rounded-lg">
                      Arraste leads para aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedLead && <LeadDetailDrawer lead={selectedLead} activities={leadActivities} onClose={() => setSelectedLead(null)} onAddActivity={(desc) => { onAddActivity(selectedLead.id, 'NOTE', desc); setActivityText(''); }} activityText={activityText} setActivityText={setActivityText} />}
    </div>
  );
}

function LeadDetailDrawer({ lead, activities, onClose, onAddActivity, activityText, setActivityText }: {
  lead: Lead;
  activities: Activity[];
  onClose: () => void;
  onAddActivity: (desc: string) => void;
  activityText: string;
  setActivityText: (v: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-baobab-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-earth-800">Detalhes do Lead</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-baobab-100">X</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <div className="font-display text-xl font-semibold text-earth-800">{lead.name}</div>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-baobab-600">
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {lead.phone}</span>
              {lead.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {lead.email}</span>}
            </div>
          </div>
          {lead.message && <div className="bg-baobab-50 rounded-lg p-3 text-sm text-baobab-700">{lead.message}</div>}
          {lead.property && (
            <Link to={`/property/${lead.property.slug}`} className="block text-sm text-okapika-700 hover:underline">
              Imóvel: {lead.property.title}
            </Link>
          )}
          <div className="text-xs text-baobab-400">Origem: {lead.source} · Criado: {new Date(lead.created_at).toLocaleDateString('pt-AO')}</div>

          {/* Activity timeline */}
          <div className="pt-4 border-t border-baobab-100">
            <h3 className="text-sm font-semibold text-earth-700 mb-3">Atividade</h3>
            <div className="flex gap-2 mb-4">
              <input value={activityText} onChange={(e) => setActivityText(e.target.value)} placeholder="Adicionar nota..." className="input text-sm flex-1" />
              <button onClick={() => activityText.trim() && onAddActivity(activityText.trim())} className="btn-primary text-sm"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-okapika-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-baobab-700">{act.description}</div>
                    <div className="text-xs text-baobab-400">{new Date(act.created_at).toLocaleString('pt-AO')}</div>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-xs text-baobab-400">Sem atividade registada.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
