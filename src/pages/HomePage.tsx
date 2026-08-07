import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/context/RouterContext';
import { PropertyCard } from '@/components/PropertyCard';
import { getRecentProperties, getFeaturedProperties } from '@/services/propertyService';
import type { Property } from '@/types';
import {
  Search,
  Home as HomeIcon,
  Building,
  Trees,
  Warehouse,
  Store,
  TrendingUp,
  Shield,
  Users,
  ArrowRight,
  Star,
} from 'lucide-react';
import { PROVINCES_OF_ANGOLA, LISTING_TYPES, PROPERTY_CATEGORIES } from '@/lib/constants';

export function HomePage() {
  const { navigate } = useRouter();
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // Search form state
  const [searchListingType, setSearchListingType] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchProvince, setSearchProvince] = useState('');

  useEffect(() => {
    Promise.all([getRecentProperties(8), getFeaturedProperties(6)])
      .then(([recent, featured]) => {
        setRecentProperties(recent);
        setFeaturedProperties(featured);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchListingType) params.set('listing_type', searchListingType);
    if (searchCategory) params.set('category', searchCategory);
    if (searchProvince) params.set('province', searchProvince);
    navigate(`/browse?${params.toString()}`);
  };

  const categories = [
    { value: 'APARTMENT', label: 'Apartamentos', icon: Building, color: 'bg-okapika-50 text-okapika-700' },
    { value: 'HOUSE', label: 'Casas', icon: HomeIcon, color: 'bg-savanna-50 text-savanna-700' },
    { value: 'LAND', label: 'Terrenos', icon: Trees, color: 'bg-acacia-50 text-acacia-700' },
    { value: 'COMMERCIAL', label: 'Comerciais', icon: Store, color: 'bg-atlantic-50 text-atlantic-700' },
    { value: 'WAREHOUSE', label: 'Armazéns', icon: Warehouse, color: 'bg-earth-100 text-earth-700' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-earth-800 via-earth-900 to-okapika-900 text-white">
        <div className="absolute inset-0 angolan-pattern opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-900/80 to-transparent" />
        
        <div className="relative container-page py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Star className="w-4 h-4 text-acacia-400" />
              <span className="text-sm font-medium">A plataforma imobiliária de Angola</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              Encontre a sua <span className="text-acacia-400">Kubata</span><br />
              em qualquer canto de Angola
            </h1>
            <p className="text-lg text-earth-200 mb-8 max-w-2xl leading-relaxed">
              Compre, arrende ou venda casas, apartamentos, terrenos e muito mais.
              Milhares de imóveis à sua espera, de Luanda a Cabinda.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 md:p-6 mt-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="label text-xs">Finalidade</label>
                <select
                  value={searchListingType}
                  onChange={(e) => setSearchListingType(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Todas</option>
                  {LISTING_TYPES.map((lt) => (
                    <option key={lt.value} value={lt.value}>{lt.labelPt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Tipo</label>
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Todos</option>
                  {PROPERTY_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.labelPt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Província</label>
                <select
                  value={searchProvince}
                  onChange={(e) => setSearchProvince(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Toda Angola</option>
                  {PROVINCES_OF_ANGOLA.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={handleSearch} className="btn-primary w-full">
                  <Search className="w-4 h-4" />
                  Procurar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-earth-800 mb-2">Procurar por categoria</h2>
          <p className="text-baobab-500">Explore imóveis por tipo</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.value}
              to={`/browse?category=${cat.value}`}
              className="card p-6 text-center group hover:shadow-lg transition-all"
            >
              <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <div className="text-sm font-semibold text-earth-800">{cat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="container-page py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-earth-800 mb-1">Imóveis em destaque</h2>
              <p className="text-baobab-500">Seleções especiais para si</p>
            </div>
            <Link to="/browse" className="hidden sm:flex items-center gap-1 text-sm font-medium text-okapika-700 hover:text-okapika-800">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Properties */}
      <section className="bg-earth-50 py-16">
        <div className="container-page">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold text-earth-800 mb-1">Anúncios recentes</h2>
              <p className="text-baobab-500">Os mais recentes imóveis no mercado</p>
            </div>
            <Link to="/browse" className="hidden sm:flex items-center gap-1 text-sm font-medium text-okapika-700 hover:text-okapika-800">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-baobab-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-baobab-200 rounded w-1/3" />
                    <div className="h-5 bg-baobab-200 rounded w-2/3" />
                    <div className="h-4 bg-baobab-200 rounded w-1/2" />
                    <div className="h-8 bg-baobab-200 rounded w-1/3 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-baobab-400">Ainda não há imóveis publicados. Volte em breve!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-page py-16">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-earth-800 mb-2">Porquê o KUBATA KIÉ?</h2>
          <p className="text-baobab-500">A forma mais segura de encontrar imóveis em Angola</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-okapika-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-okapika-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-2">Seguro e Verificado</h3>
            <p className="text-sm text-baobab-500">Todos os anúncios passam por moderação. Anunciantes verificados.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-savanna-50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-savanna-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-2">Melhores Ofertas</h3>
            <p className="text-sm text-baobab-500">Milhares de imóveis em todo o território nacional.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-atlantic-50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-atlantic-600" />
            </div>
            <h3 className="font-semibold text-earth-800 mb-2">Contacto Direto</h3>
            <p className="text-sm text-baobab-500">Fale diretamente com vendedores e agentes por chat.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-okapika-700 to-earth-800 py-16">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Tem um imóvel para vender ou arrendar?
          </h2>
          <p className="text-earth-200 mb-8 max-w-2xl mx-auto">
            Anuncie gratuitamente no KUBATA KIÉ e alcance milhares de potenciais compradores e inquilinos.
          </p>
          <button onClick={() => navigate('/auth?mode=signup')} className="btn bg-white text-okapika-700 hover:bg-earth-100 px-8 py-3 text-base">
            Começar a anunciar
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
