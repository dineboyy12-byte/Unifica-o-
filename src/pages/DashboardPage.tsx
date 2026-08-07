import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { getMyProperties, createProperty, updateProperty, deleteProperty, submitForReview } from '@/services/propertyService';
import { getMyInquiries, getMyPayments, updateInquiryStatus, updateProfile } from '@/services/dataService';
import type { Property, Profile, Inquiry, Payment, ViewingRequest } from '@/types';
import {
  LayoutDashboard,
  Plus,
  Edit2,
  Trash2,
  Send,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign,
  Home,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import {
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  PROVINCES_OF_ANGOLA,
  MUNICIPALITIES_BY_PROVINCE,
  COMMON_AMENITIES,
  CURRENCIES,
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_STATUS_COLORS,
  INQUIRY_STATUS_LABELS,
  VIEWING_STATUS_LABELS,
  PAYMENT_METHODS,
  formatPrice,
} from '@/lib/constants';

type Tab = 'overview' | 'properties' | 'inquiries' | 'viewings' | 'payments' | 'profile';

export function DashboardPage() {
  const { profile, loading: authLoading, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [viewings] = useState<ViewingRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/auth');
      return;
    }
    if (profile) {
      Promise.all([
        getMyProperties(profile.id),
        getMyInquiries(profile.id),
        getMyPayments(profile.id),
      ])
        .then(([props, inqs, pays]) => {
          setProperties(props);
          setInquiries(inqs);
          setPayments(pays);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile, authLoading, navigate]);

  const stats = {
    total: properties.length,
    published: properties.filter((p) => p.publication_status === 'PUBLISHED').length,
    pending: properties.filter((p) => p.publication_status === 'PENDING_REVIEW').length,
    drafts: properties.filter((p) => p.publication_status === 'DRAFT').length,
    inquiries: inquiries.length,
    views: properties.reduce((sum, p) => sum + p.view_count, 0),
    revenue: payments.filter((p) => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0),
  };

  if (authLoading || loading) {
    return (
      <div className="container-page py-20 flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-okapika-600 animate-spin mb-4" />
        <p className="text-baobab-500">A carregar painel...</p>
      </div>
    );
  }

  if (!profile) return null;

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'properties', label: 'Meus imóveis', icon: Home },
    { id: 'inquiries', label: 'Contactos', icon: MessageSquare },
    { id: 'viewings', label: 'Visitas', icon: Calendar },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign },
    { id: 'profile', label: 'Perfil', icon: Building2 },
  ];

  return (
    <div className="container-page py-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-60 shrink-0">
          <div className="card p-4 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-medium">
                {profile.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-earth-800 truncate">{profile.full_name || 'Utilizador'}</div>
                <div className="text-xs text-baobab-500">{profile.role}</div>
              </div>
            </div>
          </div>
          <nav className="card p-2 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-okapika-50 text-okapika-700' : 'text-baobab-600 hover:bg-baobab-100'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.id === 'inquiries' && inquiries.length > 0 && (
                  <span className="ml-auto bg-okapika-600 text-white text-xs rounded-full px-1.5">{inquiries.length}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'overview' && <OverviewTab stats={stats} properties={properties} inquiries={inquiries} setTab={setTab} />}
          {tab === 'properties' && (
            <PropertiesTab
              properties={properties}
              onEdit={(p) => { setEditingProperty(p); setShowForm(true); }}
              onRefresh={() => getMyProperties(profile.id).then(setProperties)}
              onNew={() => { setEditingProperty(null); setShowForm(true); }}
            />
          )}
          {tab === 'inquiries' && <InquiriesTab inquiries={inquiries} onRefresh={() => getMyInquiries(profile.id).then(setInquiries)} />}
          {tab === 'viewings' && <ViewingsTab viewings={viewings} />}
          {tab === 'payments' && <PaymentsTab payments={payments} />}
          {tab === 'profile' && <ProfileTab profile={profile} onRefresh={refreshProfile} />}
        </div>
      </div>

      {showForm && (
        <PropertyFormModal
          property={editingProperty}
          ownerId={profile.id}
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSaved={() => {
            setShowForm(false);
            setEditingProperty(null);
            getMyProperties(profile.id).then(setProperties);
          }}
        />
      )}
    </div>
  );
}

function OverviewTab({ stats, properties, inquiries, setTab }: {
  stats: { total: number; published: number; pending: number; drafts: number; inquiries: number; views: number; revenue: number };
  properties: Property[];
  inquiries: Inquiry[];
  setTab: (t: Tab) => void;
}) {
  const statCards = [
    { label: 'Imóveis totais', value: stats.total, icon: Home, color: 'bg-okapika-50 text-okapika-700' },
    { label: 'Publicados', value: stats.published, icon: CheckCircle2, color: 'bg-savanna-50 text-savanna-700' },
    { label: 'A aguardar aprovação', value: stats.pending, icon: Clock, color: 'bg-acacia-50 text-acacia-700' },
    { label: 'Rascunhos', value: stats.drafts, icon: Edit2, color: 'bg-baobab-100 text-baobab-700' },
    { label: 'Contactos recebidos', value: stats.inquiries, icon: MessageSquare, color: 'bg-atlantic-50 text-atlantic-700' },
    { label: 'Visualizações', value: stats.views, icon: Eye, color: 'bg-earth-100 text-earth-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-earth-800 mb-1">Painel do Vendedor</h1>
        <p className="text-baobab-500">Bem-vindo de volta! Aqui está o resumo da sua atividade.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-earth-800">{s.value}</div>
            <div className="text-sm text-baobab-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent properties */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-earth-800">Imóveis recentes</h2>
          <button onClick={() => setTab('properties')} className="text-sm text-okapika-700 hover:text-okapika-800">Ver todos</button>
        </div>
        {properties.length > 0 ? (
          <div className="space-y-2">
            {properties.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/property/${p.slug}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-baobab-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-baobab-100 flex items-center justify-center shrink-0">
                  {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover rounded-lg" /> : <Home className="w-5 h-5 text-baobab-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-earth-800 truncate">{p.title}</div>
                  <div className="text-xs text-baobab-500">{formatPrice(p.price, p.currency)}</div>
                </div>
                <span className={`badge ${PUBLICATION_STATUS_COLORS[p.publication_status]}`}>{PUBLICATION_STATUS_LABELS[p.publication_status]}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-baobab-400 mb-3">Ainda não tem imóveis.</p>
            <button onClick={() => setTab('properties')} className="btn-primary">Anunciar imóvel</button>
          </div>
        )}
      </div>

      {/* Recent inquiries */}
      {inquiries.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-earth-800">Contactos recentes</h2>
            <button onClick={() => setTab('inquiries')} className="text-sm text-okapika-700 hover:text-okapika-800">Ver todos</button>
          </div>
          <div className="space-y-2">
            {inquiries.slice(0, 5).map((inq) => (
              <div key={inq.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-baobab-50">
                <div className="w-10 h-10 rounded-full bg-atlantic-100 flex items-center justify-center text-atlantic-700 text-sm font-medium">
                  {inq.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-earth-800 truncate">{inq.name}</div>
                  <div className="text-xs text-baobab-500 truncate">{inq.message}</div>
                </div>
                <span className="text-xs text-baobab-400">{new Date(inq.created_at).toLocaleDateString('pt-AO')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertiesTab({ properties, onEdit, onRefresh, onNew }: {
  properties: Property[];
  onEdit: (p: Property) => void;
  onRefresh: () => void;
  onNew: () => void;
}) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmitReview = async (id: string) => {
    setSubmitting(id);
    try {
      await submitForReview(id);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setSubmitting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que pretende eliminar este imóvel?')) return;
    setDeleteId(id);
    try {
      await deleteProperty(id);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-earth-800">Meus imóveis</h1>
        <button onClick={onNew} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo imóvel
        </button>
      </div>

      {properties.length > 0 ? (
        <div className="space-y-3">
          {properties.map((p) => (
            <div key={p.id} className="card p-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-baobab-100 flex items-center justify-center shrink-0 overflow-hidden">
                {p.images?.[0] ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <Home className="w-8 h-8 text-baobab-400" />}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/property/${p.slug}`} className="font-medium text-earth-800 hover:text-okapika-700 line-clamp-1">{p.title}</Link>
                <div className="text-sm text-baobab-500">{formatPrice(p.price, p.currency)} · {p.province}</div>
                <div className="text-xs text-baobab-400 mt-1">{p.view_count} vistas</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge ${PUBLICATION_STATUS_COLORS[p.publication_status]}`}>{PUBLICATION_STATUS_LABELS[p.publication_status]}</span>
                <div className="flex gap-1">
                  {p.publication_status === 'DRAFT' && (
                    <button onClick={() => handleSubmitReview(p.id)} disabled={submitting === p.id} className="p-2 rounded-lg text-savanna-600 hover:bg-savanna-50" title="Enviar para aprovação">
                      {submitting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => onEdit(p)} className="p-2 rounded-lg text-baobab-600 hover:bg-baobab-100" title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} disabled={deleteId === p.id} className="p-2 rounded-lg text-okapika-600 hover:bg-okapika-50" title="Eliminar">
                    {deleteId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-baobab-100 flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-baobab-400" />
          </div>
          <h3 className="font-display text-lg font-semibold text-earth-700 mb-2">Ainda não tem imóveis</h3>
          <p className="text-baobab-500 mb-4">Comece por anunciar o seu primeiro imóvel.</p>
          <button onClick={onNew} className="btn-primary">
            <Plus className="w-4 h-4" /> Anunciar imóvel
          </button>
        </div>
      )}
    </div>
  );
}

function PropertyFormModal({ property, ownerId, onClose, onSaved }: {
  property: Property | null;
  ownerId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!property;
  const [form, setForm] = useState({
    title: property?.title || '',
    description: property?.description || '',
    listing_type: (property?.listing_type || 'SALE') as string,
    category: (property?.category || 'APARTMENT') as string,
    price: property?.price || 0,
    currency: property?.currency || 'AOA',
    province: property?.province || 'Luanda',
    municipality: property?.municipality || '',
    neighborhood: property?.neighborhood || '',
    address: property?.address || '',
    latitude: property?.latitude || undefined,
    longitude: property?.longitude || undefined,
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    area_sqm: property?.area_sqm || 0,
    contact_phone: property?.contact_phone || '',
    contact_email: property?.contact_email || '',
  });
  const [amenities, setAmenities] = useState<string[]>(property?.amenities || []);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<{ url: string }[]>(property?.images?.map((i) => ({ url: i.url })) || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const municipalities = MUNICIPALITIES_BY_PROVINCE[form.province] || [];

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, { url: imageUrl.trim() }]);
      setImageUrl('');
    }
  };

  // Geocode using Google Maps
  const handleGeocode = async () => {
    const address = `${form.neighborhood} ${form.municipality} ${form.province} Angola`;
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dHWTp9Q2jbqt4k`
      );
      const data = await response.json();
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setForm({ ...form, latitude: lat, longitude: lng });
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.price <= 0) { setError('O preço deve ser maior que zero.'); return; }
    if (!form.title.trim()) { setError('O título é obrigatório.'); return; }
    setSaving(true);
    try {
      let savedProperty: Property;
      if (isEdit && property) {
        savedProperty = await updateProperty(property.id, {
          title: form.title,
          description: form.description,
          listing_type: form.listing_type as Property['listing_type'],
          category: form.category as Property['category'],
          price: Number(form.price),
          currency: form.currency,
          province: form.province,
          municipality: form.municipality,
          neighborhood: form.neighborhood,
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          area_sqm: Number(form.area_sqm),
          amenities,
          contact_phone: form.contact_phone,
          contact_email: form.contact_email,
        });
      } else {
        savedProperty = await createProperty(ownerId, {
          title: form.title,
          description: form.description,
          listing_type: form.listing_type as Property['listing_type'],
          category: form.category as Property['category'],
          price: Number(form.price),
          currency: form.currency,
          province: form.province,
          municipality: form.municipality,
          neighborhood: form.neighborhood,
          address: form.address,
          latitude: form.latitude,
          longitude: form.longitude,
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          area_sqm: Number(form.area_sqm),
          amenities,
          contact_phone: form.contact_phone,
          contact_email: form.contact_email,
        });
        // Add images
        for (let i = 0; i < images.length; i++) {
          await supabase_add_image(savedProperty.id, images[i].url, i, i === 0);
        }
      }
      onSaved();
    } catch {
      setError('Não foi possível guardar o imóvel. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-baobab-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-display text-xl font-semibold text-earth-800">{isEdit ? 'Editar imóvel' : 'Novo imóvel'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-baobab-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-okapika-50 border border-okapika-200 text-okapika-700 text-sm rounded-lg px-4 py-3">{error}</div>}
          
          <div>
            <label className="label">Título *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Ex: Apartamento T3 em Talatona" />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[100px]" placeholder="Descreva o imóvel..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Finalidade *</label>
              <select value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value as Property['listing_type'] })} className="input">
                {LISTING_TYPES.map((lt) => <option key={lt.value} value={lt.value}>{lt.labelPt}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Property['category'] })} className="input">
                {PROPERTY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.labelPt}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Preço *</label>
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="label">Moeda</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Província *</label>
              <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value, municipality: '' })} className="input">
                {PROVINCES_OF_ANGOLA.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Município</label>
              <select value={form.municipality} onChange={(e) => setForm({ ...form, municipality: e.target.value })} className="input">
                <option value="">Selecione...</option>
                {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Bairro</label>
            <input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="input" placeholder="Ex: Talatona, Marginal..." />
          </div>
          <div>
            <label className="label">Endereço</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" placeholder="Rua, número..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Quartos</label>
              <input type="number" min="0" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="label">W.C.</label>
              <input type="number" min="0" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })} className="input" />
            </div>
            <div>
              <label className="label">Área (m²)</label>
              <input type="number" min="0" step="0.01" value={form.area_sqm} onChange={(e) => setForm({ ...form, area_sqm: Number(e.target.value) })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Telefone de contacto</label>
            <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="input" placeholder="+244 9XX XXX XXX" />
          </div>
          <div>
            <label className="label">Email de contacto</label>
            <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} className="input" placeholder="contacto@email.com" />
          </div>

          {/* Amenities */}
          <div>
            <label className="label">Comodidades</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.filter((a) => !a.startsWith(' ')).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    amenities.includes(a) ? 'bg-okapika-600 text-white border-okapika-700' : 'bg-white text-baobab-600 border-baobab-200 hover:bg-baobab-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Location on map */}
          <div>
            <button type="button" onClick={handleGeocode} className="btn-outline text-sm">
              <MapPin className="w-4 h-4" /> Obter coordenadas do mapa
            </button>
            {form.latitude && form.longitude && (
              <p className="text-xs text-savanna-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Coordenadas: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Images (URL-based for now) */}
          {!isEdit && (
            <div>
              <label className="label">Imagens (URL)</label>
              <div className="flex gap-2 mb-2">
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input" placeholder="https://..." />
                <button type="button" onClick={handleAddImage} className="btn-secondary"><Plus className="w-4 h-4" /></button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-okapika-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-baobab-100">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isEdit ? 'Guardar' : 'Criar rascunho'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper to add image
import { addPropertyImage } from '@/services/propertyService';
import { MapPin } from 'lucide-react';
async function supabase_add_image(propertyId: string, url: string, sortOrder: number, isPrimary: boolean) {
  await addPropertyImage(propertyId, url, sortOrder, isPrimary);
}

function InquiriesTab({ inquiries, onRefresh }: { inquiries: Inquiry[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await updateInquiryStatus(id, status);
      onRefresh();
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-earth-800">Contactos recebidos</h1>
      {inquiries.length > 0 ? (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-atlantic-100 flex items-center justify-center text-atlantic-700 font-medium shrink-0">
                  {inq.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-earth-800">{inq.name}</span>
                    {inq.property && (
                      <Link to={`/property/${inq.property.slug}`} className="text-xs text-okapika-700 hover:underline truncate">
                        · {inq.property.title}
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-baobab-500 mb-2">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {inq.phone}</span>
                    {inq.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inq.email}</span>}
                    <span>{new Date(inq.created_at).toLocaleDateString('pt-AO')}</span>
                  </div>
                  <p className="text-sm text-baobab-700 bg-baobab-50 rounded-lg p-3">{inq.message}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(inq.id, s)}
                        disabled={updating === inq.id}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          inq.status === s ? 'bg-okapika-600 text-white' : 'bg-baobab-100 text-baobab-600 hover:bg-baobab-200'
                        }`}
                      >
                        {INQUIRY_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-baobab-300 mx-auto mb-3" />
          <p className="text-baobab-500">Ainda não recebeu contactos.</p>
        </div>
      )}
    </div>
  );
}

function ViewingsTab({ viewings }: { viewings: ViewingRequest[] }) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-earth-800">Visitas agendadas</h1>
      {viewings.length > 0 ? (
        <div className="space-y-3">
          {viewings.map((v) => (
            <div key={v.id} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-acacia-50 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-acacia-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-earth-800">{new Date(v.requested_date).toLocaleDateString('pt-AO')} às {v.requested_time}</div>
                {v.property && <Link to={`/property/${v.property.slug}`} className="text-sm text-okapika-700 hover:underline">{v.property.title}</Link>}
                {v.notes && <p className="text-xs text-baobab-500 mt-1">{v.notes}</p>}
              </div>
              <span className="badge bg-acacia-50 text-acacia-700 border-acacia-200">{VIEWING_STATUS_LABELS[v.status]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Calendar className="w-12 h-12 text-baobab-300 mx-auto mb-3" />
          <p className="text-baobab-500">Ainda não tem visitas agendadas.</p>
        </div>
      )}
    </div>
  );
}

function PaymentsTab({ payments }: { payments: Payment[] }) {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold text-earth-800">Pagamentos</h1>
      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((pay) => (
            <div key={pay.id} className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-savanna-50 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 text-savanna-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-earth-800">{formatPrice(pay.amount, pay.currency)}</div>
                <div className="text-sm text-baobab-500">{PAYMENT_METHODS.find((m) => m.value === pay.payment_method)?.label}</div>
                {pay.description && <div className="text-xs text-baobab-400 mt-1">{pay.description}</div>}
              </div>
              <span className={`badge ${
                pay.status === 'COMPLETED' ? 'bg-savanna-50 text-savanna-700 border-savanna-200' :
                pay.status === 'PENDING' ? 'bg-acacia-50 text-acacia-700 border-acacia-200' :
                'bg-okapika-50 text-okapika-700 border-okapika-200'
              }`}>{pay.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <DollarSign className="w-12 h-12 text-baobab-300 mx-auto mb-3" />
          <p className="text-baobab-500">Ainda não tem pagamentos registados.</p>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    bio: profile.bio || '',
    agency_name: profile.agency_name || '',
    agent_license: profile.agent_license || '',
    province: profile.province || '',
    city: profile.city || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile.id, form);
      await onRefresh();
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-earth-800">Perfil</h1>
        {!editing && <button onClick={() => setEditing(true)} className="btn-outline"><Edit2 className="w-4 h-4" /> Editar</button>}
      </div>

      {saved && <div className="bg-savanna-50 border border-savanna-200 text-savanna-700 text-sm rounded-lg px-4 py-3">Perfil atualizado com sucesso!</div>}

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 text-2xl font-medium">
            {profile.full_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-display text-xl font-semibold text-earth-800">{profile.full_name || 'Utilizador'}</div>
            <div className="text-sm text-baobab-500">{profile.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge bg-okapika-50 text-okapika-700 border-okapika-200">{profile.role}</span>
              {profile.is_verified && <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200">Verificado</span>}
            </div>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div><label className="label">Nome completo</label><input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="input" /></div>
            <div><label className="label">Telefone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" /></div>
            {(profile.role === 'AGENT' || profile.role === 'AGENCY') && (
              <>
                <div><label className="label">Nome da agência</label><input value={form.agency_name} onChange={(e) => setForm({ ...form, agency_name: e.target.value })} className="input" /></div>
                <div><label className="label">Licença de agente</label><input value={form.agent_license} onChange={(e) => setForm({ ...form, agent_license: e.target.value })} className="input" /></div>
              </>
            )}
            <div><label className="label">Província</label>
              <select value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="input">
                <option value="">Selecione...</option>
                {PROVINCES_OF_ANGOLA.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className="label">Cidade</label><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input" /></div>
            <div><label className="label">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input min-h-[80px]" /></div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="btn-ghost flex-1">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Telefone" value={profile.phone} />
            <InfoRow label="Província" value={profile.province} />
            {profile.agency_name && <InfoRow label="Agência" value={profile.agency_name} />}
            {profile.agent_license && <InfoRow label="Licença" value={profile.agent_license} />}
            {profile.bio && <div className="col-span-2"><div className="text-baobab-500 mb-1">Bio</div><div className="text-earth-700">{profile.bio}</div></div>}
            <InfoRow label="Membro desde" value={new Date(profile.created_at).toLocaleDateString('pt-AO')} />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-baobab-500 mb-1">{label}</div>
      <div className="text-earth-700">{value || '—'}</div>
    </div>
  );
}
