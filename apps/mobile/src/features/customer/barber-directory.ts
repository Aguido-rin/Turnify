import type {
  CommercialBarber,
  CommercialCatalog,
  CommercialService,
} from '../queue/commercial-queue-api';

export * from './business-directory';

/**
 * Lightweight business directory for virtual queue discovery.
 * Retains 1 minimal barbería plus 2 additional sectors (Salud and Atención)
 * to demonstrate multi-rubro virtual queue scalability without code bloating.
 */

export type BusinessCategory =
  | 'barberia'
  | 'salud'
  | 'atencion_cliente'
  | 'gastronomia'
  | 'retail'
  | 'general';

export type BusinessDirectoryEntry = {
  businessId: string;
  code: string;
  name: string;
  district: string;
  distanceKm: number;
  etaMinutes: number;
  isOpen: boolean;
  category: BusinessCategory;
  categoryLabel: string;
  staffLabel: string;
  requiresSpecificStaff: boolean;
  catalog: CommercialCatalog;
};

export type BarberDirectoryEntry = BusinessDirectoryEntry;

const catalog = (
  name: string,
  isOpen: boolean,
  services: CommercialService[],
  barbers: CommercialBarber[]
): CommercialCatalog => ({
  name,
  open: isOpen,
  services,
  barbers,
});

const service = (
  id: string,
  name: string,
  description: string,
  minutes: number
): CommercialService => ({
  serviceId: id,
  name,
  description,
  estimatedDurationSeconds: minutes * 60,
  measuredDurationSeconds: null,
  referencePriceCents: null,
});

const staff = (
  id: string,
  name: string,
  state: CommercialBarber['operationalState'],
  serviceIds: string[]
): CommercialBarber => ({
  barberId: id,
  name,
  operationalState: state,
  fotoUrl: null,
  serviceIds,
});

export const BARBER_DISTRICTS = ['Todos', 'Miraflores', 'San Isidro', 'Barranco'] as const;
export type BarberDistrict = (typeof BARBER_DISTRICTS)[number];

export const BUSINESS_CATEGORIES = [
  'Todos',
  'Barberías',
  'Salud',
  'Atención',
  'Restaurantes',
  'Comercio',
] as const;
export type CategoryFilter = (typeof BUSINESS_CATEGORIES)[number];

const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  barberia: 'Barbería',
  salud: 'Salud',
  atencion_cliente: 'Atención',
  gastronomia: 'Restaurante',
  retail: 'Comercio',
  general: 'General',
};

const DEFAULT_STAFF_LABELS: Record<BusinessCategory, string> = {
  barberia: 'Barbero',
  salud: 'Médico',
  atencion_cliente: 'Asesor',
  gastronomia: 'Anfitrión',
  retail: 'Asesor',
  general: 'Profesional',
};

export const BUSINESS_DIRECTORY: BusinessDirectoryEntry[] = [
  // 1. Barbería Mínima de Referencia (Única barbería de demostración)
  {
    businessId: 'dir-barberia-01',
    code: 'BARBERIA-DEMO',
    name: 'Barbería Estilo Demo',
    district: 'Miraflores',
    distanceKm: 0.5,
    etaMinutes: 5,
    isOpen: true,
    category: 'barberia',
    categoryLabel: 'Barbería',
    staffLabel: 'Barbero',
    requiresSpecificStaff: true,
    catalog: catalog(
      'Barbería Estilo Demo',
      true,
      [
        service('svc-b-cut', 'Corte clásico', 'Corte de cabello y peinado.', 30),
        service('svc-b-beard', 'Corte + barba', 'Corte integral y perfilado.', 45),
      ],
      [
        staff('barb-001', 'Carlos Méndez', 'disponible', ['svc-b-cut', 'svc-b-beard']),
        staff('barb-002', 'Diego Salas', 'disponible', ['svc-b-cut', 'svc-b-beard']),
      ]
    ),
  },
  // 2. Rubro Adicional: Salud / Consultorio
  {
    businessId: 'dir-salud-01',
    code: 'CLINICA-DEMO',
    name: 'Centro Médico Sanitas Demo',
    district: 'San Isidro',
    distanceKm: 1.2,
    etaMinutes: 8,
    isOpen: true,
    category: 'salud',
    categoryLabel: 'Salud',
    staffLabel: 'Médico',
    requiresSpecificStaff: true,
    catalog: catalog(
      'Centro Médico Sanitas Demo',
      true,
      [
        service('svc-s-med', 'Medicina general', 'Consulta médica y evaluación rápida.', 20),
        service('svc-s-triage', 'Triaje y control', 'Toma de presión, signos vitales y vacunas.', 15),
      ],
      [
        staff('med-001', 'Dra. Valeria Gómez', 'disponible', ['svc-s-med', 'svc-s-triage']),
        staff('med-002', 'Dr. Andrés Paz', 'disponible', ['svc-s-med']),
      ]
    ),
  },
  // 3. Rubro Adicional: Atención al Cliente / Trámites
  {
    businessId: 'dir-atencion-01',
    code: 'TRAMITES-DEMO',
    name: 'Atención al Ciudadano Demo',
    district: 'Barranco',
    distanceKm: 1.8,
    etaMinutes: 4,
    isOpen: true,
    category: 'atencion_cliente',
    categoryLabel: 'Atención',
    staffLabel: 'Asesor',
    requiresSpecificStaff: false,
    catalog: catalog(
      'Atención al Ciudadano Demo',
      true,
      [
        service('svc-a-rapida', 'Trámites y orientación', 'Consultas de documentos y expedientes.', 15),
        service('svc-a-mesa', 'Mesa de partes rápida', 'Recepción y sellado de documentos.', 10),
      ],
      [
        staff('ase-001', 'Módulo 1 · Ana Torres', 'disponible', ['svc-a-rapida', 'svc-a-mesa']),
        staff('ase-002', 'Módulo 2 · Juan Quispe', 'disponible', ['svc-a-rapida', 'svc-a-mesa']),
      ]
    ),
  },
];

export const BARBER_DIRECTORY = BUSINESS_DIRECTORY;

export function normalizeBusinessCategory(raw?: string | null): BusinessCategory {
  const value = (raw ?? '').trim().toLowerCase();
  if (
    value === 'barberia' ||
    value === 'salud' ||
    value === 'atencion_cliente' ||
    value === 'gastronomia' ||
    value === 'retail' ||
    value === 'general'
  ) {
    return value;
  }
  return 'general';
}

export function getBusinessCategoryLabel(category?: string | null): string {
  return CATEGORY_LABELS[normalizeBusinessCategory(category)];
}

export function getStaffRoleLabel(category?: string | null, customLabel?: string | null): string {
  const trimmed = (customLabel ?? '').trim();
  if (trimmed.length > 0 && trimmed.toLowerCase() !== 'profesional') {
    return trimmed;
  }
  return DEFAULT_STAFF_LABELS[normalizeBusinessCategory(category)];
}

export function getSelectStaffTitle(category?: string | null, customLabel?: string | null): string {
  const roleLabel = getStaffRoleLabel(category, customLabel).toLowerCase();
  return `Elige tu ${roleLabel}`;
}

export function categoryFilterToSlug(filter: CategoryFilter): BusinessCategory | null {
  switch (filter) {
    case 'Barberías':
      return 'barberia';
    case 'Salud':
      return 'salud';
    case 'Atención':
      return 'atencion_cliente';
    case 'Restaurantes':
      return 'gastronomia';
    case 'Comercio':
      return 'retail';
    case 'Todos':
    default:
      return null;
  }
}

export function nearbyBarberias(
  limit = 5,
  source: BusinessDirectoryEntry[] = BUSINESS_DIRECTORY
): BusinessDirectoryEntry[] {
  return [...source].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

export function barberiasByDistrict(
  district: BarberDistrict,
  source: BusinessDirectoryEntry[] = BUSINESS_DIRECTORY
): BusinessDirectoryEntry[] {
  if (district === 'Todos') return source;
  return source.filter((entry) => entry.district === district);
}

export function businessesByCategory(
  categoryFilter: CategoryFilter,
  source: BusinessDirectoryEntry[] = BUSINESS_DIRECTORY
): BusinessDirectoryEntry[] {
  const slug = categoryFilterToSlug(categoryFilter);
  if (!slug) return source;
  return source.filter((entry) => entry.category === slug);
}

export function searchBusinesses(
  query: string,
  categoryFilter: CategoryFilter = 'Todos',
  source: BusinessDirectoryEntry[] = BUSINESS_DIRECTORY
): BusinessDirectoryEntry[] {
  const normalized = query.trim().toLowerCase();
  const list = businessesByCategory(categoryFilter, source);
  if (!normalized) return list;
  return list.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.code.toLowerCase().includes(normalized) ||
      item.district.toLowerCase().includes(normalized) ||
      item.categoryLabel.toLowerCase().includes(normalized)
  );
}

export function barberAvailableCount(entry: BusinessDirectoryEntry): number {
  return entry.catalog.barbers.filter((item) => item.operationalState === 'disponible').length;
}

export function barberServiceMinPrice(entry: BusinessDirectoryEntry): number | null {
  const prices = entry.catalog.services
    .map((item) => item.referencePriceCents)
    .filter((value): value is number => value !== null);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}