import { Link } from '@/context/RouterContext';
import { Heart, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import type { Property } from '@/types';
import { formatPrice, LISTING_TYPES, PROPERTY_CATEGORIES, PROPERTY_STATUS_LABELS } from '@/lib/constants';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorite } from '@/services/dataService';

export function PropertyCard({ property }: { property: Property }) {
  const { profile } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const primaryImage = property.images?.find((img) => img.is_primary) || property.images?.[0];
  const listingLabel = LISTING_TYPES.find((l) => l.value === property.listing_type)?.labelPt || property.listing_type;
  const categoryLabel = PROPERTY_CATEGORIES.find((c) => c.value === property.category)?.labelPt || property.category;

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;
    const result = await toggleFavorite(profile.id, property.id);
    setIsFav(result);
  };

  return (
    <Link
      to={`/property/${property.slug}`}
      className="card overflow-hidden group hover:shadow-lg transition-all duration-300 animate-fade-in"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-baobab-100">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-earth-200 to-earth-300">
            <MapPin className="w-12 h-12 text-earth-400" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`badge ${property.listing_type === 'SALE' ? 'bg-okapika-600 text-white border-okapika-700' : 'bg-atlantic-600 text-white border-atlantic-700'}`}>
            {listingLabel}
          </span>
          {property.featured && (
            <span className="badge bg-acacia-500 text-white border-acacia-600">Destaque</span>
          )}
        </div>
        {profile && (
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-okapika-600 text-okapika-600' : 'text-baobab-500'}`} />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-baobab-500 font-medium">{categoryLabel}</span>
          <span className="text-xs text-savanna-600 font-medium">{PROPERTY_STATUS_LABELS[property.property_status]}</span>
        </div>
        <h3 className="font-display text-base font-semibold text-earth-800 line-clamp-1 mb-2 group-hover:text-okapika-700 transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-baobab-500 mb-3 flex items-center gap-1 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {property.neighborhood ? `${property.neighborhood}, ` : ''}{property.municipality || property.province}
        </p>

        <div className="flex items-center gap-4 text-xs text-baobab-600 mb-3">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5" /> {property.bathrooms}
            </span>
          )}
          {property.area_sqm > 0 && (
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5" /> {property.area_sqm}m²
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-baobab-100">
          <div>
            <div className="text-lg font-bold text-okapika-700">
              {formatPrice(property.price, property.currency)}
            </div>
            {property.listing_type === 'RENT' && (
              <div className="text-xs text-baobab-400">por mês</div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
