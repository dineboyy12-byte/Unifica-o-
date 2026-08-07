import type {
  ListingType,
  PropertyCategory,
  PropertyStatus,
  PublicationStatus,
  UserRole,
  PaymentMethod,
  InquiryStatus,
  ViewingStatus,
} from '@/types';

export const PROVINCES_OF_ANGOLA = [
  'Luanda',
  'Benguela',
  'Huambo',
  'Huíla',
  'Bié',
  'Cabinda',
  'Cunene',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire',
  'Bengo',
  'Moxico',
] as const;

export const MUNICIPALITIES_BY_PROVINCE: Record<string, string[]> = {
  Luanda: [
    'Luanda',
    'Belas',
    'Cazenga',
    'Talatona',
    'Viana',
    'Icolo e Bengo',
    'Quiçama',
    'Kilamba Kiaxi',
    'Maianga',
    'Rangel',
    'Ingombota',
    'Samba',
  ],
  Benguela: ['Benguela', 'Baía Farta', 'Catumbela', 'Lobito', 'Bocoio', 'Balombo', 'Chongoroi', 'Cubal', 'Ganda'],
  Huambo: ['Huambo', 'Caála', 'Longonjo', 'Chinjenje', 'Ecunha', 'Ukuma', 'Mungo', 'Tchikala-Tcholo'],
  Huíla: ['Lubango', 'Cacula', 'Humpata', 'Matala', 'Quipungo', 'Gambos', 'Chibia', 'Quilengues'],
  Bié: ['Kuito', 'Andulo', 'Nharea', 'Catabola', 'Camacupa', 'Cuvango', 'Chitembo'],
  Cabinda: ['Cabinda', 'Cacongo', 'Buco-Zau', 'Belize'],
  Cunene: ['Ondjiva', 'Cuanhama', 'Curoca', 'Namacunde', 'Cuvelai', 'Matala'],
  'Cuando Cubango': ['Menongue', 'Cuito Cuanavale', 'Dirico', 'Mavinga', 'Rivungo', 'Nancova'],
  'Cuanza Norte': ['Ndalatando', 'Cazengo', 'Golungo Alto', 'Banga', 'Samba Cajú', 'Lucala'],
  'Cuanza Sul:': ['Sumbe', 'Amboim', 'Cela', 'Cassongue', 'Ebo', 'Libolo', 'Mussende', 'Quibala'],
  'Cuanza Sul': ['Sumbe', 'Amboim', 'Cela', 'Cassongue', 'Ebo', 'Libolo', 'Mussende', 'Quibala', 'Seles'],
  'Lunda Norte': ['Dundo', 'Cambulo', 'Capenda-Camulemba', 'Caungula', 'Cuílo', 'Lubalo', 'Xá-Muteba'],
  'Lunda Sul:': ['Saurimo', 'Cacolo', 'Dala', 'Lumeje', 'Muconda'],
  'Lunda Sul': ['Saurimo', 'Cacolo', 'Dala', 'Lumeje', 'Muconda'],
  Malanje: ['Malanje', 'Cacuso', 'Calandula', 'Cuaba Nzogi', 'Cangandala', 'Caombo', 'Kiwaba Nzoji'],
  Moxico: ['Luena', 'Alto Zambeze', 'Bundas', 'Camanongue', 'Léua', 'Luacano', 'Lumeje'],
  Namibe: ['Namibe', 'Bibala', 'Camacuio', 'Tômbua', 'Virei'],
  Uíge: ['Uíge', 'Alto Cauale', 'Bungo', 'Damba', 'Maquela do Zombo', 'Mucaba', 'Negage'],
  Zaire: ['Mbanza Congo', 'Cuimba', 'Nóqui', 'Soyo', 'Tomboco'],
  Bengo: ['Caxito', 'Ambriz', 'Bula Atumba', 'Dande', 'Dembos', 'Nambuangongo', 'Pango Aluquém'],
};

export const LISTING_TYPES: { value: ListingType; label: string; labelPt: string }[] = [
  { value: 'SALE', label: 'For Sale', labelPt: 'Venda' },
  { value: 'RENT', label: 'For Rent', labelPt: 'Arrendamento' },
  { value: 'BUY', label: 'Want to Buy', labelPt: 'Compra' },
];

export const PROPERTY_CATEGORIES: { value: PropertyCategory; label: string; labelPt: string }[] = [
  { value: 'APARTMENT', label: 'Apartment', labelPt: 'Apartamento' },
  { value: 'HOUSE', label: 'House', labelPt: 'Casa' },
  { value: 'LAND', label: 'Land', labelPt: 'Terreno' },
  { value: 'COMMERCIAL', label: 'Commercial', labelPt: 'Comercial' },
  { value: 'WAREHOUSE', label: 'Warehouse', labelPt: 'Armazém' },
  { value: 'OFFICE', label: 'Office', labelPt: 'Escritório' },
  { value: 'FARM', label: 'Farm', labelPt: 'Quinta' },
];

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  AVAILABLE: 'Disponível',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
  RENTED: 'Arrendado',
  UNAVAILABLE: 'Indisponível',
};

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'A aguardar aprovação',
  CHANGES_REQUESTED: 'Alterações solicitadas',
  APPROVED: 'Aprovado',
  PUBLISHED: 'Publicado',
  REJECTED: 'Rejeitado',
  SUSPENDED: 'Suspenso',
  ARCHIVED: 'Arquivado',
};

export const PUBLICATION_STATUS_COLORS: Record<PublicationStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  CHANGES_REQUESTED: 'bg-orange-50 text-orange-700 border-orange-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
  PUBLISHED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  SUSPENDED: 'bg-purple-50 text-purple-700 border-purple-200',
  ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const USER_ROLES: { value: UserRole; label: string; labelPt: string }[] = [
  { value: 'USER', label: 'User', labelPt: 'Utilizador' },
  { value: 'SELLER', label: 'Seller', labelPt: 'Vendedor' },
  { value: 'AGENT', label: 'Agent', labelPt: 'Agente' },
  { value: 'AGENCY', label: 'Agency', labelPt: 'Agência' },
  { value: 'ADMIN', label: 'Admin', labelPt: 'Administrador' },
  { value: 'SUPER_ADMIN', label: 'Super Admin', labelPt: 'Super Administrador' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: 'EXPRESS', label: 'Express (Multicaixa Express)', description: 'Pagamento via Multicaixa Express' },
  { value: 'UNITEL_MONEY', label: 'Unitel Money', description: 'Transferência via Unitel Money' },
  { value: 'BANK_TRANSFER', label: 'Transferência Bancária', description: 'Transferência interbancária (IBAN)' },
  { value: 'CASH', label: 'Numerário', description: 'Pagamento em dinheiro' },
  { value: 'CARD', label: 'Cartão (Multicaixa)', description: 'Pagamento com cartão Multicaixa' },
];

export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
  NEW: 'Novo',
  CONTACTED: 'Contactado',
  QUALIFIED: 'Qualificado',
  CLOSED: 'Fechado',
};

export const VIEWING_STATUS_LABELS: Record<ViewingStatus, string> = {
  REQUESTED: 'Solicitada',
  CONFIRMED: 'Confirmada',
  RESCHEDULED: 'Reagendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'Não compareceu',
};

export const COMMON_AMENITIES = [
  'Água canalizada',
  'Energia elétrica',
  'Fossa séptica',
  'Cerca elétrica',
  'Gerador',
  'Ar condicionado',
  'Piscina',
  'Garagem',
  'Estacionamento',
  'Segurança 24h',
  'Elevador',
  'Vista para o mar',
  ' Jardim',
  'Sala de reuniões',
  'Cozinha equipada',
  'Roupeiros embutidos',
  'Sistema de segurança',
  'Vigilância por câmaras',
  'Ginásio',
  'Playground',
];

export const CURRENCIES = [
  { code: 'AOA', symbol: 'Kz', label: 'Kwanza (AOA)' },
  { code: 'USD', symbol: '$', label: 'Dólar (USD)' },
  { code: 'EUR', symbol: '€', label: 'Euro (EUR)' },
];

export function formatPrice(price: number, currency: string): string {
  const cur = CURRENCIES.find((c) => c.code === currency);
  const symbol = cur?.symbol || 'Kz';
  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
  return `${symbol} ${formatted}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
