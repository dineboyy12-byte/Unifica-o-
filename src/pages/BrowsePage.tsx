import { useEffect, useState, useCallback } from 'react';
import { useRouter } from '@/context/RouterContext';
import { PropertyCard } from '@/components/PropertyCard';
import { searchProperties, type PropertyFilters } from '@/services/propertyService';
import type { Property } from '@/types';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  PROVINCES_OF_ANGOLA,
  MUNICIPALITIES_BY_PROVINCE,
  LISTING_TYPES,
  PROPERTY_CATEGORIES,
} from '@/lib/constants';

export function BrowsePage() {
  const { route, navigate } = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  const [filters, setFilters] = useState<PropertyFilters>({
    listing_type: route.params.listing_type || '',
    category: route.params.category || '',
    province: route.params.province || '',
    municipality: route.params.municipality || '',
    query: route.params.query || '',
    minPrice: route.params.minPrice ? Number(route.params.minPrice) : undefined,
    maxPrice: route.params.maxPrice ? Number(route.params.maxPrice) : undefined,
    bedrooms: route.params.bedrooms ? Number(route.params.bedrooms) : undefined,
    bathrooms: route.params.bathrooms ? Number(route.params.bathrooms) : undefined,
    sort: route.params.sort || 'newest',
  });

  const loadProperties = useCallback(async (p: number, f: PropertyFilters) => {
    setLoading(true);
    try {
      const result = await searchProperties({ ...f, page: p, limit });
      setProperties(result.properties);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sync filters from URL params on mount
    const newFilters: PropertyFilters = {
      listing_type: route.params.listing_type || '',
      category: route.params.category || '',
      province: route.params.province || '',
      municipality: route.params.municipality || '',
      query: route.params.query || '',
      minPrice: route.params.minPrice ? Number(route.params.minPrice) : undefined,
      maxPrice: route.params.maxPrice ? Number(route.params.maxPrice) : undefined,
      bedrooms: route.params.bedrooms ? Number(route.params.bedrooms) : undefined,
      bathrooms: route.params.bathrooms ? Number(route.params.bathrooms) : undefined,
      sort: route.params.sort || 'newest',
    };
    setFilters(newFilters);
    setPage(1);
    loadProperties(1, newFilters);
  }, [route.params, loadProperties]);

  const updateUrl = (newFilters: PropertyFilters, newPage: number) => {
    const params = new URLSearchParams();
    if (newFilters.listing_type) params.set('listing_type', newFilters.listing_type);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.province) params.set('province', newFilters.province);
    if (newFilters.municipality) params.set('municipality', newFilters.municipality);
    if (newFilters.query) params.set('query', newFilters.query);
    if (newFilters.minPrice) params.set('minPrice', String(newFilters.minPrice));
    if (newFilters.maxPrice) params.set('maxPrice', String(newFilters.maxPrice));
    if (newFilters.bedrooms) params.set('bedrooms', String(newFilters.bedrooms));
    if (newFilters.bathrooms) params.set('bathrooms', String(newFilters.bathrooms));
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newPage > 1) params.set('page', String(newPage));
    navigate(`/browse?${params.toString()}`);
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    setPage(1);
    updateUrl(newFilters, 1);
    loadProperties(1, newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl(filters, 1);
    loadProperties(1, filters);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(filters, newPage);
    loadProperties(newPage, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const cleared: PropertyFilters = { sort: 'newest' };
    setFilters(cleared);
    setPage(1);
    navigate('/browse');
    loadProperties(1, cleared);
  };

  const municipalities = filters.province ? MUNICIPALITIES_BY_PROVINCE[filters.province] || [] : [];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container-page py-8 animate-fade-in">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-baobab-400" />
            <input
              type="text"
              placeholder="Procurar por título, bairro ou descrição..."
              value={filters.query || ''}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="input pl-11"
            />
          </div>
          <button type="submit" className="btn-primary">
            <Search className="w-4 h-4" />
            Procurar
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </form>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-black/50 lg:bg-transparent lg:static lg:z-auto' : 'hidden lg:block'} w-full lg:w-72 shrink-0`}>
          <div className={`${showFilters ? 'fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto lg:static lg:shadow-none' : ''} lg:sticky lg:top-20 space-y-5 p-5 lg:p-0`}>
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h3 className="font-semibold text-earth-800">Filtros</h3>
              <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-baobab-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterGroup title="Finalidade">
              <select value={filters.listing_type || ''} onChange={(e) => handleFilterChange('listing_type', e.target.value)} className="input text-sm">
                <option value="">Todas</option>
                {LISTING_TYPES.map((lt) => <option key={lt.value} value={lt.value}>{lt.labelPt}</option>)}
              </select>
            </FilterGroup>

            <FilterGroup title="Tipo de Imóvel">
              <select value={filters.category || ''} onChange={(e) => handleFilterChange('category', e.target.value)} className="input text-sm">
                <option value="">Todos</option>
                {PROPERTY_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.labelPt}</option>)}
              </select>
            </FilterGroup>

            <FilterGroup title="Localização">
              <select value={filters.province || ''} onChange={(e) => handleFilterChange('province', e.target.value)} className="input text-sm mb-2">
                <option value="">Toda Angola</option>
                {PROVINCES_OF_ANGOLA.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {municipalities.length > 0 && (
                <select value={filters.municipality || ''} onChange={(e) => handleFilterChange('municipality', e.target.value)} className="input text-sm">
                  <option value="">Todos os municípios</option>
                  {municipalities.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              )}
            </FilterGroup>

            <FilterGroup title="Preço (Kz)">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="input text-sm"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                  className="input text-sm"
                />
              </div>
            </FilterGroup>

            <FilterGroup title="Quartos (mínimo)">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleFilterChange('bedrooms', filters.bedrooms === n ? undefined : n)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      filters.bedrooms === n ? 'bg-okapika-600 text-white' : 'bg-baobab-100 text-baobab-600 hover:bg-baobab-200'
                    }`}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Casas de banho (mínimo)">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleFilterChange('bathrooms', filters.bathrooms === n ? undefined : n)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      filters.bathrooms === n ? 'bg-okapika-600 text-white' : 'bg-baobab-100 text-baobab-600 hover:bg-baobab-200'
                    }`}
                  >
                    {n}+
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Ordenar por">
              <select value={filters.sort || 'newest'} onChange={(e) => handleFilterChange('sort', e.target.value)} className="input text-sm">
                <option value="newest">Mais recentes</option>
                <option value="price_low">Preço: menor para maior</option>
                <option value="price_high">Preço: maior para menor</option>
                <option value="area">Maior área</option>
              </select>
            </FilterGroup>

            <button onClick={clearFilters} className="btn-ghost w-full text-sm">
              Limpar filtros
            </button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-baobab-600">
              {loading ? 'A procurar...' : `${total} imóvel${total !== 1 ? 'is' : ''} encontrado${total !== 1 ? 's' : ''}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg border border-baobab-200 text-baobab-600 hover:bg-baobab-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          page === pageNum ? 'bg-okapika-600 text-white' : 'border border-baobab-200 text-baobab-600 hover:bg-baobab-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={!hasMore}
                    className="p-2 rounded-lg border border-baobab-200 text-baobab-600 hover:bg-baobab-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-full bg-baobab-100 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-baobab-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-earth-700 mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-baobab-500 mb-4">Tente ajustar os filtros para ver mais resultados.</p>
              <button onClick={clearFilters} className="btn-outline">
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-earth-700 mb-2">{title}</h3>
      {children}
    </div>
  );
}
