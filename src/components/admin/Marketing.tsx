import type { Campaign, Banner } from '@/services/adminService';
import { Megaphone, Image as ImageIcon, Plus, Eye, MousePointer, Target, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { formatPrice } from '@/lib/constants';

interface Props {
  campaigns: Campaign[];
  banners: Banner[];
  onCreateCampaign: (input: Partial<Campaign>) => void;
  onUpdateCampaign: (id: string, updates: Partial<Campaign>) => void;
  onToggleBanner: (id: string, active: boolean) => void;
}

export function Marketing({ campaigns, banners, onCreateCampaign, onUpdateCampaign, onToggleBanner }: Props) {
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('FEATURED');

  const handleCreate = () => {
    if (!campaignName.trim()) return;
    onCreateCampaign({ name: campaignName, type: campaignType, status: 'DRAFT' });
    setCampaignName('');
    setShowCampaignForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Campaigns */}
      <div className="bg-white rounded-xl border border-baobab-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-semibold text-earth-800 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-atlantic-600" /> Campanhas
          </h3>
          <button onClick={() => setShowCampaignForm(!showCampaignForm)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Nova campanha
          </button>
        </div>

        {showCampaignForm && (
          <div className="flex gap-2 mb-4 p-3 bg-baobab-50 rounded-lg">
            <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Nome da campanha" className="input text-sm flex-1" />
            <select value={campaignType} onChange={(e) => setCampaignType(e.target.value)} className="input text-sm w-40">
              <option value="FEATURED">Destaque</option>
              <option value="PREMIUM">Premium</option>
              <option value="PROMOTION">Promoção</option>
              <option value="ADVERTISING">Publicidade</option>
            </select>
            <button onClick={handleCreate} className="btn-primary text-sm">Criar</button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : '0';
            const conv = c.clicks > 0 ? ((c.conversions / c.clicks) * 100).toFixed(1) : '0';
            return (
              <div key={c.id} className="border border-baobab-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-earth-800 text-sm">{c.name}</span>
                  <span className={`badge ${c.status === 'ACTIVE' ? 'bg-savanna-50 text-savanna-700 border-savanna-200' : 'bg-baobab-100 text-baobab-600 border-baobab-200'}`}>{c.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-baobab-500"><Eye className="w-3 h-3" /> {c.impressions} impressões</div>
                  <div className="flex items-center gap-1 text-baobab-500"><MousePointer className="w-3 h-3" /> {c.clicks} cliques</div>
                  <div className="flex items-center gap-1 text-baobab-500"><Target className="w-3 h-3" /> CTR: {ctr}%</div>
                  <div className="flex items-center gap-1 text-baobab-500">Conv: {conv}%</div>
                  <div className="flex items-center gap-1 text-baobab-500"><DollarSign className="w-3 h-3" /> {formatPrice(c.spent, 'AOA')} / {formatPrice(c.budget, 'AOA')}</div>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-baobab-50">
                  <button onClick={() => onUpdateCampaign(c.id, { status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })} className="text-xs text-okapika-700 hover:underline">
                    {c.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                  </button>
                </div>
              </div>
            );
          })}
          {campaigns.length === 0 && <p className="text-sm text-baobab-400 col-span-full text-center py-8">Sem campanhas. Crie a primeira!</p>}
        </div>
      </div>

      {/* Banners */}
      <div className="bg-white rounded-xl border border-baobab-100 p-5">
        <h3 className="font-display text-base font-semibold text-earth-800 mb-4 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-acacia-600" /> Banners publicitários
        </h3>
        <div className="space-y-2">
          {banners.map((b) => (
            <div key={b.id} className="flex items-center gap-4 p-3 border border-baobab-100 rounded-lg">
              <div className="w-16 h-10 rounded bg-baobab-100 flex items-center justify-center shrink-0 overflow-hidden">
                {b.image_url ? <img src={b.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-baobab-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-earth-800">{b.title}</div>
                <div className="text-xs text-baobab-500">Posição: {b.position} · {b.impressions} impressões · {b.clicks} cliques</div>
              </div>
              <button
                onClick={() => onToggleBanner(b.id, !b.is_active)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${b.is_active ? 'bg-savanna-600 text-white' : 'bg-baobab-200 text-baobab-700'}`}
              >
                {b.is_active ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          ))}
          {banners.length === 0 && <p className="text-sm text-baobab-400 text-center py-8">Sem banners.</p>}
        </div>
      </div>
    </div>
  );
}
