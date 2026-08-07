import { useEffect, useState } from 'react';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import { getFavorites } from '@/services/dataService';
import { PropertyCard } from '@/components/PropertyCard';
import type { Favorite, Property } from '@/types';
import { Heart, Loader2 } from 'lucide-react';

export function FavoritesPage() {
  const { profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !profile) {
      navigate('/auth');
      return;
    }
    if (profile) {
      getFavorites(profile.id)
        .then(setFavorites)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profile, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="container-page py-20 flex flex-col items-center">
        <Loader2 className="w-8 h-8 text-okapika-600 animate-spin mb-4" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="container-page py-8 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-earth-800 mb-6">Meus favoritos</h1>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <PropertyCard key={fav.id} property={fav.property as Property} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Heart className="w-12 h-12 text-baobab-300 mx-auto mb-3" />
          <p className="text-baobab-500 mb-4">Ainda não tem imóveis guardados como favoritos.</p>
          <button onClick={() => navigate('/browse')} className="btn-primary">Procurar imóveis</button>
        </div>
      )}
    </div>
  );
}
