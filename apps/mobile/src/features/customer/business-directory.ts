export type BusinessRubro =
  | 'barberia'
  | 'salud'
  | 'atencion_cliente'
  | 'gastronomia'
  | 'retail'
  | 'general';

export type BusinessCategoryFilter = 'all' | BusinessRubro;

export interface DemoServiceItem {
  id: string;
  nombre: string;
  duracionMin: number;
  precio?: number;
}

export interface DemoStaffItem {
  id: string;
  nombre: string;
  especialidad?: string;
}

export interface DirectoryBusiness {
  id: string;
  nombre: string;
  codigo: string;
  rubro: BusinessRubro;
  etiquetaAtendedor: string;
  descripcion: string;
  direccion: string;
  abierta: boolean;
  latitud?: number | null;
  longitud?: number | null;
  estimatedWaitMin: number;
  requiresSpecificStaff: boolean;
  servicios: DemoServiceItem[];
  atendedores: DemoStaffItem[];
}

export const BUSINESS_CATEGORY_OPTIONS: Array<{
  id: BusinessCategoryFilter;
  label: string;
  icon: string;
}> = [
  { id: 'all', label: 'Todas', icon: 'apps' },
  { id: 'barberia', label: 'Barberías', icon: 'cut' },
  { id: 'salud', label: 'Salud', icon: 'medkit' },
  { id: 'atencion_cliente', label: 'Trámites', icon: 'business' },
  { id: 'gastronomia', label: 'Restaurantes', icon: 'restaurant' },
  { id: 'retail', label: 'Comercio', icon: 'bag-handle' },
];

const RUBRO_LABELS: Record<BusinessRubro, string> = {
  barberia: 'Barbería y Estética',
  salud: 'Salud y Consultorios',
  atencion_cliente: 'Atención y Trámites',
  gastronomia: 'Restaurantes y Cafeterías',
  retail: 'Retail y Comercio',
  general: 'Atención General',
};

const DEFAULT_STAFF_ROLE_LABELS: Record<BusinessRubro, string> = {
  barberia: 'Barbero / Estilista',
  salud: 'Médico / Especialista',
  atencion_cliente: 'Asesor / Módulo',
  gastronomia: 'Anfitrión / Barra',
  retail: 'Asesor / Caja',
  general: 'Profesional',
};

/**
 * Directorio demo ultraligero:
 * - Exactamente 1 barbería mínima de referencia
 * - 2 rubros adicionales sencillos para validar escalabilidad multirrubro
 */
export const DEMO_BUSINESS_DIRECTORY: DirectoryBusiness[] = [
  {
    id: 'demo-barberia-01',
    nombre: 'Turnify Barbería Demo',
    codigo: 'BARBERIA-DEMO',
    rubro: 'barberia',
    etiquetaAtendedor: 'Barbero',
    descripcion: 'Cortes clásicos y arreglo de barba con atención por orden de llegada.',
    direccion: 'Av. Larco 450, Miraflores',
    abierta: true,
    latitud: -12.1219,
    longitud: -77.0297,
    estimatedWaitMin: 15,
    requiresSpecificStaff: true,
    servicios: [
      { id: 'srv-barb-1', nombre: 'Corte clásico', duracionMin: 30, precio: 35 },
      { id: 'srv-barb-2', nombre: 'Corte + barba', duracionMin: 45, precio: 50 },
    ],
    atendedores: [
      { id: 'stf-barb-1', nombre: 'Carlos Méndez', especialidad: 'Corte y degradado' },
      { id: 'stf-barb-2', nombre: 'Diego Salas', especialidad: 'Barba y estilo clásico' },
    ],
  },
  {
    id: 'demo-salud-01',
    nombre: 'Clínica Sanitas Demo',
    codigo: 'SALUD-DEMO',
    rubro: 'salud',
    etiquetaAtendedor: 'Médico / Especialista',
    descripcion: 'Consultas ambulatorias y triaje rápido sin hacer fila presencial.',
    direccion: 'Av. Javier Prado Este 1120, San Isidro',
    abierta: true,
    latitud: -12.0908,
    longitud: -77.0226,
    estimatedWaitMin: 20,
    requiresSpecificStaff: true,
    servicios: [
      { id: 'srv-sal-1', nombre: 'Medicina general', duracionMin: 20 },
      { id: 'srv-sal-2', nombre: 'Triaje y control', duracionMin: 10 },
    ],
    atendedores: [
      { id: 'stf-sal-1', nombre: 'Dra. Elena Ríos', especialidad: 'Medicina General' },
    ],
  },
  {
    id: 'demo-tramites-01',
    nombre: 'Centro de Atención Ciudadana Demo',
    codigo: 'TRAMITES-DEMO',
    rubro: 'atencion_cliente',
    etiquetaAtendedor: 'Asesor / Módulo',
    descripcion: 'Ventanilla única para gestiones rápidas y orientación ciudadana.',
    direccion: 'Jr. de la Unión 310, Centro',
    abierta: true,
    latitud: -12.0464,
    longitud: -77.0324,
    estimatedWaitMin: 10,
    requiresSpecificStaff: false,
    servicios: [
      { id: 'srv-tra-1', nombre: 'Trámites rápidos', duracionMin: 15 },
      { id: 'srv-tra-2', nombre: 'Asesoría personalizada', duracionMin: 25 },
    ],
    atendedores: [],
  },
];

export function normalizeRubro(rubro?: string | null): BusinessRubro {
  const value = (rubro ?? '').trim().toLowerCase();
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

export function getBusinessCategoryLabel(rubro?: string | null): string {
  return RUBRO_LABELS[normalizeRubro(rubro)];
}

export function getStaffRoleLabel(rubro?: string | null, customLabel?: string | null): string {
  const trimmed = (customLabel ?? '').trim();
  if (trimmed.length > 0 && trimmed.toLowerCase() !== 'profesional') {
    return trimmed;
  }
  return DEFAULT_STAFF_ROLE_LABELS[normalizeRubro(rubro)];
}

export function getSelectStaffTitle(rubro?: string | null, customLabel?: string | null): string {
  const roleLabel = getStaffRoleLabel(rubro, customLabel).toLowerCase();
  return `Elige tu ${roleLabel}`;
}

export function filterDemoBusinesses(
  businesses: DirectoryBusiness[],
  query: string,
  category: BusinessCategoryFilter = 'all'
): DirectoryBusiness[] {
  const normalizedQuery = query.trim().toLowerCase();
  return businesses.filter((item) => {
    const matchesCategory = category === 'all' || item.rubro === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;
    return (
      item.nombre.toLowerCase().includes(normalizedQuery) ||
      item.codigo.toLowerCase().includes(normalizedQuery) ||
      item.direccion.toLowerCase().includes(normalizedQuery) ||
      getBusinessCategoryLabel(item.rubro).toLowerCase().includes(normalizedQuery)
    );
  });
}