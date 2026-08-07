import { supabase } from '@/lib/supabase';
import type { Property, PropertyImage } from '@/types';
import { slugify } from '@/lib/constants';

export interface PropertyFilters {
  listing_type?: string;
  category?: string;
  province?: string;
  municipality?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  query?: string;
  status?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PropertyResult {
  properties: Property[];
  total: number;
  hasMore: boolean;
}

export async function searchProperties(filters: PropertyFilters = {}): Promise<PropertyResult> {
  const {
    listing_type,
    category,
    province,
    municipality,
    neighborhood,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    query,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = filters;

  let q = supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `, { count: 'exact' })
    .eq('publication_status', 'PUBLISHED');

  // By default only show available, unless status filter is set
  if (filters.status && filters.status !== 'ALL') {
    q = q.eq('property_status', filters.status);
  } else if (!filters.status) {
    q = q.eq('property_status', 'AVAILABLE');
  }

  if (listing_type) q = q.eq('listing_type', listing_type);
  if (category) q = q.eq('category', category);
  if (province) q = q.eq('province', province);
  if (municipality) q = q.eq('municipality', municipality);
  if (neighborhood) q = q.ilike('neighborhood', `%${neighborhood}%`);
  if (minPrice !== undefined) q = q.gte('price', minPrice);
  if (maxPrice !== undefined) q = q.lte('price', maxPrice);
  if (bedrooms !== undefined) q = q.gte('bedrooms', bedrooms);
  if (bathrooms !== undefined) q = q.gte('bathrooms', bathrooms);
  if (minArea !== undefined) q = q.gte('area_sqm', minArea);
  if (maxArea !== undefined) q = q.lte('area_sqm', maxArea);
  if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%,neighborhood.ilike.%${query}%`);

  // Sorting
  switch (sort) {
    case 'price_low':
      q = q.order('price', { ascending: true });
      break;
    case 'price_high':
      q = q.order('price', { ascending: false });
      break;
    case 'area':
      q = q.order('area_sqm', { ascending: false });
      break;
    default:
      q = q.order('created_at', { ascending: false });
  }

  // Featured first
  q = q.order('featured', { ascending: false });

  const offset = (page - 1) * limit;
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;

  if (error) throw error;

  const properties = (data || []) as unknown as Property[];
  return {
    properties,
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Property;
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Property;
}

export async function getMyProperties(ownerId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      images:property_images(*)
    `)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as Property[];
}

export async function getAllProperties(filters: PropertyFilters = {}): Promise<PropertyResult> {
  const { page = 1, limit = 20, sort = 'newest', ...rest } = filters;
  let q = supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `, { count: 'exact' });

  if (rest.listing_type) q = q.eq('listing_type', rest.listing_type);
  if (rest.category) q = q.eq('category', rest.category);
  if (rest.province) q = q.eq('province', rest.province);
  if (rest.status) q = q.eq('publication_status', rest.status);
  if (rest.query) q = q.or(`title.ilike.%${rest.query}%,description.ilike.%${rest.query}%`);

  switch (sort) {
    case 'price_low':
      q = q.order('price', { ascending: true });
      break;
    case 'price_high':
      q = q.order('price', { ascending: false });
      break;
    default:
      q = q.order('created_at', { ascending: false });
  }

  const offset = (page - 1) * limit;
  q = q.range(offset, offset + limit - 1);

  const { data, error, count } = await q;
  if (error) throw error;

  return {
    properties: (data || []) as unknown as Property[],
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

export async function createProperty(
  ownerId: string,
  input: {
    title: string;
    description?: string;
    listing_type: string;
    category: string;
    price: number;
    currency: string;
    province: string;
    municipality?: string;
    neighborhood?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    bedrooms?: number;
    bathrooms?: number;
    area_sqm?: number;
    amenities?: string[];
    contact_phone?: string;
    contact_email?: string;
  }
): Promise<Property> {
  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const { data, error } = await supabase
    .from('properties')
    .insert({
      owner_id: ownerId,
      title: input.title,
      slug,
      description: input.description,
      listing_type: input.listing_type,
      category: input.category,
      price: input.price,
      currency: input.currency,
      province: input.province,
      municipality: input.municipality,
      neighborhood: input.neighborhood,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      bedrooms: input.bedrooms || 0,
      bathrooms: input.bathrooms || 0,
      area_sqm: input.area_sqm || 0,
      amenities: input.amenities || [],
      contact_phone: input.contact_phone,
      contact_email: input.contact_email,
      publication_status: 'DRAFT',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Property;
}

export async function updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Property;
}

export async function submitForReview(id: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ publication_status: 'PENDING_REVIEW' })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throw error;
}

export async function incrementViewCount(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_view_count', { property_id: id });
  if (error) {
    // Fallback: direct update
    // Fallback: no-op if RPC fails
  }
}

export async function addPropertyImage(propertyId: string, url: string, sortOrder: number, isPrimary: boolean, storagePath?: string): Promise<PropertyImage> {
  const { data, error } = await supabase
    .from('property_images')
    .insert({
      property_id: propertyId,
      url,
      storage_path: storagePath,
      sort_order: sortOrder,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PropertyImage;
}

export async function deletePropertyImage(imageId: string): Promise<void> {
  const { error } = await supabase.from('property_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `)
    .eq('publication_status', 'PUBLISHED')
    .eq('property_status', 'AVAILABLE')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as unknown as Property[];
}

export async function getRecentProperties(limit = 8): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `)
    .eq('publication_status', 'PUBLISHED')
    .eq('property_status', 'AVAILABLE')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as unknown as Property[];
}

// Admin operations
export async function adminUpdatePublicationStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ publication_status: status })
    .eq('id', id);
  if (error) throw error;
}

export async function adminUpdatePropertyStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ property_status: status })
    .eq('id', id);
  if (error) throw error;
}

export async function adminToggleFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await supabase
    .from('properties')
    .update({ featured })
    .eq('id', id);
  if (error) throw error;
}

export async function getPendingProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:profiles!properties_owner_id_fkey(*),
      images:property_images(*)
    `)
    .eq('publication_status', 'PENDING_REVIEW')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as Property[];
}
