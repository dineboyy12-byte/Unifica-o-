import { useEffect, useState } from 'react';
import { useRouter, Link } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { getPropertyBySlug, incrementViewCount } from '@/services/propertyService';
import { createInquiry, createViewingRequest, isFavorited, toggleFavorite } from '@/services/dataService';
import { getOrCreateConversation, sendMessage } from '@/services/chatService';
import type { Property } from '@/types';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Loader2,
} from 'lucide-react';
import {
  formatPrice,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
  PROPERTY_STATUS_LABELS,
} from '@/lib/constants';

export function PropertyDetailPage() {
  const { route, navigate } = useRouter();
  const { profile } = useAuth();
  const slug = route.path.split('/property/')[1];
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showViewingForm, setShowViewingForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Contact form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Viewing form
  const [viewingDate, setViewingDate] = useState('');
  const [viewingTime, setViewingTime] = useState('');
  const [viewingNotes, setViewingNotes] = useState('');

  // Chat
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPropertyBySlug(slug)
      .then((p) => {
        setProperty(p);
        if (p) {
          incrementViewCount(p.id).catch(() => {});
          if (profile) {
            isFavorited(profile.id, p.id).then(setIsFav).catch(() => {});
          }
        } else {
          setError('Imóvel não encontrado.');
        }
      })
      .catch(() => setError('Não foi possível carregar este imóvel.'))
      .finally(() => setLoading(false));
  }, [slug, profile]);

  const handleFavorite = async () => {
    if (!profile) {
      navigate('/auth');
      return;
    }
    if (!property) return;
    const result = await toggleFavorite(profile.id, property.id);
    setIsFav(result);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: property?.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setSuccessMsg('Link copiado!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;
    setSubmitting(true);
    try {
      await createInquiry({
        property_id: property.id,
        recipient_id: property.owner_id,
        user_id: profile?.id || null,
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        message: contactMessage,
      });
      setSuccessMsg('Mensagem enviada com sucesso! O anunciante irá contactá-lo em breve.');
      setShowContactForm(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch {
      setSuccessMsg('Não foi possível enviar a mensagem. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !profile) {
      navigate('/auth');
      return;
    }
    setSubmitting(true);
    try {
      await createViewingRequest({
        property_id: property.id,
        user_id: profile.id,
        requested_date: viewingDate,
        requested_time: viewingTime,
        notes: viewingNotes,
      });
      setSuccessMsg('Visita solicitada! O anunciante irá confirmar a disponibilidade.');
      setShowViewingForm(false);
      setViewingDate('');
      setViewingTime('');
      setViewingNotes('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch {
      setSuccessMsg('Não foi possível solicitar a visita. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async () => {
    if (!profile) {
      navigate('/auth');
      return;
    }
    if (!property) return;
    setShowChat(true);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !property || !chatMessage.trim()) return;
    setSubmitting(true);
    try {
      const conversation = await getOrCreateConversation(property.id, profile.id, property.owner_id);
      await sendMessage(conversation.id, profile.id, chatMessage);
      setSuccessMsg('Mensagem enviada! Pode continuar a conversa nas suas mensagens.');
      setShowChat(false);
      setChatMessage('');
      setTimeout(() => setSuccessMsg(''), 3000);
      navigate('/messages');
    } catch {
      setSuccessMsg('Não foi possível iniciar a conversa. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-okapika-600 animate-spin mb-4" />
        <p className="text-baobab-500">A carregar imóvel...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-baobab-500 mb-4">{error || 'Imóvel não encontrado.'}</p>
        <Link to="/browse" className="btn-primary">Voltar à procura</Link>
      </div>
    );
  }

  const images = property.images || [];
  const listingLabel = LISTING_TYPES.find((l) => l.value === property.listing_type)?.labelPt;
  const categoryLabel = PROPERTY_CATEGORIES.find((c) => c.value === property.category)?.labelPt;
  const propertyAmenities = property.amenities || [];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="container-page pt-6">
        <div className="flex items-center gap-2 text-sm text-baobab-500">
          <Link to="/" className="hover:text-okapika-700">Início</Link>
          <span>/</span>
          <Link to="/browse" className="hover:text-okapika-700">Imóveis</Link>
          <span>/</span>
          <span className="text-earth-700 truncate">{property.title}</span>
        </div>
      </div>

      {/* Gallery */}
      <div className="container-page py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {/* Main image */}
          <div
            className="lg:col-span-3 aspect-[16/10] rounded-xl overflow-hidden bg-baobab-100 cursor-pointer relative group"
            onClick={() => images.length > 0 && setLightboxOpen(true)}
          >
            {images[currentImage] ? (
              <img src={images[currentImage].url} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-earth-200 to-earth-300">
                <Building2 className="w-16 h-16 text-earth-400" />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImage((currentImage - 1 + images.length) % images.length); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImage((currentImage + 1) % images.length); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 text-white text-xs">
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="lg:col-span-1 grid grid-cols-4 lg:grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImage(i)}
                  className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-colors ${
                    i === currentImage ? 'border-okapika-600' : 'border-transparent hover:border-baobab-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-page pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-okapika-50 text-okapika-700 border-okapika-200">{listingLabel}</span>
                <span className="badge bg-earth-100 text-earth-700 border-earth-200">{categoryLabel}</span>
                <span className="badge bg-savanna-50 text-savanna-700 border-savanna-200">{PROPERTY_STATUS_LABELS[property.property_status]}</span>
                {property.featured && <span className="badge bg-acacia-50 text-acacia-700 border-acacia-200">Destaque</span>}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-earth-800 mb-3">{property.title}</h1>
              <p className="text-baobab-600 flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-okapika-600" />
                {property.address ? `${property.address}, ` : ''}
                {property.neighborhood ? `${property.neighborhood}, ` : ''}
                {property.municipality ? `${property.municipality}, ` : ''}
                {property.province}
              </p>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <FeatureBox icon={Bed} label="Quartos" value={property.bedrooms > 0 ? String(property.bedrooms) : '—'} />
              <FeatureBox icon={Bath} label="W.C." value={property.bathrooms > 0 ? String(property.bathrooms) : '—'} />
              <FeatureBox icon={Maximize} label="Área" value={property.area_sqm > 0 ? `${property.area_sqm}m²` : '—'} />
              <FeatureBox icon={Building2} label="Tipo" value={categoryLabel || '—'} />
            </div>

            {/* Description */}
            {property.description && (
              <div>
                <h2 className="font-display text-xl font-semibold text-earth-800 mb-3">Descrição</h2>
                <p className="text-baobab-700 leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Amenities */}
            {propertyAmenities.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-earth-800 mb-3">Comodidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {propertyAmenities.map((a) => (
                    <div key={a} className="flex items-center gap-2 text-sm text-baobab-700">
                      <CheckCircle2 className="w-4 h-4 text-savanna-600 shrink-0" />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div>
                <h2 className="font-display text-xl font-semibold text-earth-800 mb-3">Localização</h2>
                <div className="rounded-xl overflow-hidden border border-baobab-200">
                  <iframe
                    width="100%"
                    height="350"
                    loading="lazy"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dHWTp9Q2jbqt4k&q=${property.latitude},${property.longitude}&zoom=14`}
                    title="Mapa do imóvel"
                  />
                </div>
                <p className="text-xs text-baobab-400 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.municipality || property.province}, Angola
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="card p-6 sticky top-20">
              <div className="text-3xl font-bold text-okapika-700 mb-1">
                {formatPrice(property.price, property.currency)}
              </div>
              {property.listing_type === 'RENT' && (
                <div className="text-sm text-baobab-500 mb-4">por mês</div>
              )}

              <div className="space-y-3 py-4 border-y border-baobab-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-baobab-500">Estado</span>
                  <span className="font-medium text-earth-700">{PROPERTY_STATUS_LABELS[property.property_status]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-baobab-500">Finalidade</span>
                  <span className="font-medium text-earth-700">{listingLabel}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-baobab-500">Visto</span>
                  <span className="font-medium text-earth-700">{property.view_count} vezes</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-4">
                <button onClick={() => setShowContactForm(true)} className="btn-primary w-full">
                  <Mail className="w-4 h-4" />
                  Contactar anunciante
                </button>
                <button onClick={() => setShowViewingForm(true)} className="btn-secondary w-full">
                  <Calendar className="w-4 h-4" />
                  Agendar visita
                </button>
                <button onClick={handleStartChat} className="btn-outline w-full">
                  <MessageCircle className="w-4 h-4" />
                  Iniciar conversa
                </button>
                <div className="flex gap-2">
                  <button onClick={handleFavorite} className="btn-outline flex-1">
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-okapika-600 text-okapika-600' : ''}`} />
                    {isFav ? 'Guardado' : 'Guardar'}
                  </button>
                  <button onClick={handleShare} className="btn-outline flex-1">
                    <Share2 className="w-4 h-4" />
                    Partilhar
                  </button>
                </div>
              </div>
            </div>

            {/* Advertiser info */}
            {property.owner && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-earth-700 mb-3">Anunciante</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-earth-200 flex items-center justify-center text-earth-700 font-medium">
                    {property.owner.full_name?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <div className="font-medium text-earth-800">{property.owner.full_name || 'Anunciante'}</div>
                    <div className="text-xs text-baobab-500">
                      {property.owner.role === 'AGENT' ? 'Agente imobiliário' :
                       property.owner.role === 'AGENCY' ? 'Agência imobiliária' :
                       property.owner.role === 'SELLER' ? 'Vendedor' : 'Utilizador'}
                    </div>
                  </div>
                </div>
                {property.owner.is_verified && (
                  <div className="flex items-center gap-1.5 text-xs text-savanna-700 bg-savanna-50 rounded-lg px-3 py-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Anunciante verificado
                  </div>
                )}
                {property.contact_phone && (
                  <a href={`tel:${property.contact_phone}`} className="flex items-center gap-2 text-sm text-baobab-600 mt-3 hover:text-okapika-700">
                    <Phone className="w-4 h-4" /> {property.contact_phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
          <img src={images[currentImage].url} alt={property.title} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImage((currentImage - 1 + images.length) % images.length); }}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setCurrentImage((currentImage + 1) % images.length); }}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Contact form modal */}
      {showContactForm && (
        <Modal title="Contactar anunciante" onClose={() => setShowContactForm(false)}>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="label">Nome *</label>
              <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className="input" placeholder="O seu nome" />
            </div>
            <div>
              <label className="label">Telefone *</label>
              <input required type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="input" placeholder="+244 9XX XXX XXX" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="input" placeholder="seu@email.com" />
            </div>
            <div>
              <label className="label">Mensagem *</label>
              <textarea required value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="input min-h-[100px]" placeholder="Tenho interesse neste imóvel..." />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Enviar mensagem
            </button>
          </form>
        </Modal>
      )}

      {/* Viewing form modal */}
      {showViewingForm && (
        <Modal title="Agendar visita" onClose={() => setShowViewingForm(false)}>
          {!profile ? (
            <div className="text-center py-4">
              <p className="text-baobab-600 mb-4">Precisa de iniciar sessão para agendar uma visita.</p>
              <Link to="/auth" className="btn-primary">Entrar / Registar</Link>
            </div>
          ) : (
            <form onSubmit={handleViewingSubmit} className="space-y-4">
              <div>
                <label className="label">Data pretendida *</label>
                <input required type="date" value={viewingDate} onChange={(e) => setViewingDate(e.target.value)} className="input" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="label">Hora pretendida *</label>
                <input required type="time" value={viewingTime} onChange={(e) => setViewingTime(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Notas</label>
                <textarea value={viewingNotes} onChange={(e) => setViewingNotes(e.target.value)} className="input min-h-[80px]" placeholder="Alguma informação adicional?" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                Solicitar visita
              </button>
            </form>
          )}
        </Modal>
      )}

      {/* Chat modal */}
      {showChat && (
        <Modal title="Conversar com anunciante" onClose={() => setShowChat(false)}>
          {!profile ? (
            <div className="text-center py-4">
              <p className="text-baobab-600 mb-4">Precisa de iniciar sessão para conversar.</p>
              <Link to="/auth" className="btn-primary">Entrar / Registar</Link>
            </div>
          ) : (
            <form onSubmit={handleSendChatMessage} className="space-y-4">
              <div>
                <label className="label">Mensagem</label>
                <textarea required value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} className="input min-h-[100px]" placeholder="Olá, tenho interesse neste imóvel..." />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Enviar e abrir conversa
              </button>
            </form>
          )}
        </Modal>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="fixed bottom-4 right-4 z-50 bg-savanna-600 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-up flex items-center gap-2 max-w-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm">{successMsg}</span>
        </div>
      )}
    </div>
  );
}

function FeatureBox({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <Icon className="w-6 h-6 text-okapika-600 mx-auto mb-2" />
      <div className="text-xs text-baobab-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-earth-800">{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-earth-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-baobab-100">
            <X className="w-5 h-5 text-baobab-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
