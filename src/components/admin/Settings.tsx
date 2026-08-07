import type { Setting, LegalDocument } from '@/services/adminService';
import { useState } from 'react';
import { Save, FileText, History, Eye, EyeOff } from 'lucide-react';

interface Props {
  settings: Setting[];
  legalDocs: LegalDocument[];
  onUpdateSetting: (key: string, value: string) => void;
  onUpdateLegalDoc: (id: string, content: string, title: string) => void;
}

const SETTING_CATEGORIES = [
  { code: 'GENERAL', label: 'Geral' },
  { code: 'PROPERTIES', label: 'Imóveis' },
  { code: 'PAYMENTS', label: 'Pagamentos' },
  { code: 'FEATURE_FLAGS', label: 'Funcionalidades' },
  { code: 'SEO', label: 'SEO' },
  { code: 'NOTIFICATIONS', label: 'Notificações' },
];

const LEGAL_TYPES = [
  { code: 'TERMS', label: 'Termos e Condições' },
  { code: 'PRIVACY', label: 'Política de Privacidade' },
  { code: 'COOKIES', label: 'Política de Cookies' },
  { code: 'MARKETPLACE_RULES', label: 'Regras do Marketplace' },
  { code: 'PROPERTY_RULES', label: 'Regras de Anúncios' },
  { code: 'PAYMENT_RULES', label: 'Regras de Pagamento' },
  { code: 'CANCELLATION', label: 'Política de Cancelamento' },
  { code: 'SERVICE_RULES', label: 'Regras de Serviços' },
];

export function Settings({ settings, legalDocs, onUpdateSetting, onUpdateLegalDoc }: Props) {
  const [section, setSection] = useState<'settings' | 'legal'>('settings');
  const [settingsCategory, setSettingsCategory] = useState('GENERAL');
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [selectedLegalType, setSelectedLegalType] = useState('TERMS');
  const [legalContent, setLegalContent] = useState('');
  const [legalTitle, setLegalTitle] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const categorySettings = settings.filter((s) => s.category === settingsCategory);
  const activeLegalDoc = legalDocs.find((d) => d.type === selectedLegalType && d.is_active);
  const typeVersions = legalDocs.filter((d) => d.type === selectedLegalType).sort((a, b) => b.version - a.version);

  const handleLoadLegal = (type: string) => {
    setSelectedLegalType(type);
    const doc = legalDocs.find((d) => d.type === type && d.is_active);
    if (doc) {
      setLegalContent(doc.content);
      setLegalTitle(doc.title);
    } else {
      setLegalContent('');
      setLegalTitle(LEGAL_TYPES.find((t) => t.code === type)?.label || '');
    }
  };

  const handleSaveLegal = () => {
    const doc = legalDocs.find((d) => d.type === selectedLegalType && d.is_active);
    if (doc) {
      onUpdateLegalDoc(doc.id, legalContent, legalTitle);
      setSavedMsg('Documento legal atualizado! Nova versão criada.');
      setTimeout(() => setSavedMsg(''), 3000);
    }
  };

  const handleSaveSetting = (key: string) => {
    if (editingValues[key] !== undefined) {
      onUpdateSetting(key, editingValues[key]);
      setSavedMsg('Configuração salva!');
      setTimeout(() => setSavedMsg(''), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {savedMsg && <div className="bg-savanna-50 border border-savanna-200 text-savanna-700 text-sm rounded-lg px-4 py-3">{savedMsg}</div>}

      {/* Section toggle */}
      <div className="flex gap-2">
        <button onClick={() => setSection('settings')} className={`px-4 py-2 rounded-lg text-sm font-medium ${section === 'settings' ? 'bg-okapika-600 text-white' : 'bg-white text-baobab-600 border border-baobab-200'}`}>
          Configurações
        </button>
        <button onClick={() => setSection('legal')} className={`px-4 py-2 rounded-lg text-sm font-medium ${section === 'legal' ? 'bg-okapika-600 text-white' : 'bg-white text-baobab-600 border border-baobab-200'}`}>
          Documentos Legais
        </button>
      </div>

      {section === 'settings' && (
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {SETTING_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                onClick={() => setSettingsCategory(cat.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${settingsCategory === cat.code ? 'bg-earth-200 text-earth-800' : 'bg-white text-baobab-600 border border-baobab-200 hover:bg-baobab-50'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl border border-baobab-100 divide-y divide-baobab-50">
            {categorySettings.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-earth-800">{s.key}</span>
                    {s.is_public ? <Eye className="w-3 h-3 text-savanna-600" /> : <EyeOff className="w-3 h-3 text-baobab-400" />}
                  </div>
                  {s.description && <div className="text-xs text-baobab-500 mt-0.5">{s.description}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {s.data_type === 'BOOLEAN' ? (
                    <select
                      value={editingValues[s.key] ?? s.value ?? 'false'}
                      onChange={(e) => setEditingValues({ ...editingValues, [s.key]: e.target.value })}
                      className="input text-sm w-28"
                    >
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  ) : (
                    <input
                      value={editingValues[s.key] ?? s.value ?? ''}
                      onChange={(e) => setEditingValues({ ...editingValues, [s.key]: e.target.value })}
                      className="input text-sm w-48"
                      type={s.data_type === 'NUMBER' ? 'number' : 'text'}
                    />
                  )}
                  <button onClick={() => handleSaveSetting(s.key)} className="p-2 rounded-lg text-savanna-600 hover:bg-savanna-50">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {categorySettings.length === 0 && <div className="p-8 text-center text-sm text-baobab-400">Sem configurações nesta categoria.</div>}
          </div>
        </>
      )}

      {section === 'legal' && (
        <div className="space-y-4">
          {/* Document type selector */}
          <div className="flex flex-wrap gap-2">
            {LEGAL_TYPES.map((t) => (
              <button
                key={t.code}
                onClick={() => handleLoadLegal(t.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${selectedLegalType === t.code ? 'bg-earth-200 text-earth-800' : 'bg-white text-baobab-600 border border-baobab-200 hover:bg-baobab-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Editor */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-baobab-100 p-5 space-y-3">
              <div>
                <label className="label">Título</label>
                <input value={legalTitle} onChange={(e) => setLegalTitle(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Conteúdo</label>
                <textarea value={legalContent} onChange={(e) => setLegalContent(e.target.value)} className="input min-h-[300px] font-mono text-sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-baobab-400">
                  {activeLegalDoc ? `Versão atual: v${activeLegalDoc.version}` : 'Sem versão ativa'}
                </span>
                <button onClick={handleSaveLegal} className="btn-primary text-sm">
                  <Save className="w-4 h-4" /> Guardar nova versão
                </button>
              </div>
            </div>

            {/* Version history */}
            <div className="bg-white rounded-xl border border-baobab-100 p-5">
              <button onClick={() => setShowVersions(!showVersions)} className="flex items-center gap-2 text-sm font-semibold text-earth-700 mb-3 w-full">
                <History className="w-4 h-4" /> Histórico de versões
              </button>
              {showVersions && (
                <div className="space-y-2">
                  {typeVersions.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg border border-baobab-100">
                      <FileText className="w-4 h-4 text-baobab-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-earth-700">v{v.version}</div>
                        <div className="text-xs text-baobab-400">{new Date(v.updated_at).toLocaleDateString('pt-AO')}</div>
                      </div>
                      {v.is_active && <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200">Ativa</span>}
                    </div>
                  ))}
                  {typeVersions.length === 0 && <p className="text-xs text-baobab-400">Sem versões.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
