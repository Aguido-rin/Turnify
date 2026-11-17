import type { CommercialBarber, CommercialCatalog, CommercialService } from '@/features/queue/commercial-queue-api';

/**
 * Lightweight business directory for virtual queue discovery.
 * Stripped of redundant mock shops to keep the client ultra-lightweight.
 * Retains 1 minimal barbería plus 2 additional sectors (Salud and Atención)
 * to demonstrate multi-rubro virtual queue scalability without code bloating.
 */

export type BusinessCategory = 'barberia' | 'salud' | 'atencion_cliente';

export type BarberDirectoryEntry = {
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
  catalog: CommercialCatalog;
};

const catalog = (name: string, isOpen: boolean, services: CommercialService[], barbers: CommercialBarber[]): CommercialCatalog => ({
  name,
  open: isOpen,
  services,
  barbers,
});

const service = (id: string, name: string, description: string, minutes: number): CommercialService => ({
  serviceId: id,
  name,
  description,
  estimatedDurationSeconds: minutes * 60,
  measuredDurationSeconds: null,
  referencePriceCents: null,
});

const staff = (id: string, name: string, state: CommercialBarber['operationalState'], serviceIds: string[]): CommercialBarber => ({
  barberId: id,
  name,
  operationalState: state,
  fotoUrl: null,
  serviceIds,
});

export const BARBER_DISTRICTS = ['Todos', 'Miraflores', 'San Isidro', 'Barranco'] as const;
export type BarberDistrict = (typeof BARBER_DISTRICTS)[number];

export const BUSINESS_CATEGORIES = ['Todos', 'Barberías', 'Salud', 'Atención'] as const;
export type CategoryFilter = (typeof BUSINESS_CATEGORIES)[number];

export const BARBER_DIRECTORY: BarberDirectoryEntry[] = [
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
    catalog: catalog('Barbería Estilo Demo', true, [
      service('svc-b-cut', 'Corte clásico', 'Corte de cabello y peinado.', 30),
      service('svc-b-beard', 'Corte + barba', 'Corte integral y perfilado.', 45),
    ], [
      staff('barb-001', 'Carlos Méndez', 'disponible', ['svc-b-cut', 'svc-b-beard']),
      staff('barb-002', 'Diego Salas', 'disponible', ['svc-b-cut', 'svc-b-beard']),
    ]),
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
    catalog: catalog('Centro Médico Sanitas Demo', true, [
      service('svc-s-med', 'Medicina general', 'Consulta médica y evaluación rápida.', 20),
      service('svc-s-triage', 'Triaje y control', 'Toma de presión, signos vitales y vacunas.', 15),
    ], [
      staff('med-001', 'Dra. Valeria Gómez', 'disponible', ['svc-s-med', 'svc-s-triage']),
      staff('med-002', 'Dr. Andrés Paz', 'disponible', ['svc-s-med']),
    ]),
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
    catalog: catalog('Atención al Ciudadano Demo', true, [
      service('svc-a-rapida', 'Trámites y orientación', 'Consultas de documentos y expedientes.', 15),
      service('svc-a-mesa', 'Mesa de partes rápida', 'Recepción y sellado de documentos.', 10),
    ], [
      staff('ase-001', 'Módulo 1 · Ana Torres', 'disponible', ['svc-a-rapida', 'svc-a-mesa']),
      staff('ase-002', 'Módulo 2 · Juan Quispe', 'disponible', ['svc-a-rapida', 'svc-a-mesa']),
    ]),
  },
];

export function nearbyBarberias(limit = 5): BarberDirectoryEntry[] {
  return [...BARBER_DIRECTORY].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

export function barberiasByDistrict(district: BarberDistrict): BarberDirectoryEntry[] {
  if (district === 'Todos') return BARBER_DIRECTORY;
  return BARBER_DIRECTORY.filter((entry) => entry.district === district);
}

export function businessesByCategory(categoryFilter: CategoryFilter): BarberDirectoryEntry[] {
  if (categoryFilter === 'Todos') return BARBER_DIRECTORY;
  if (categoryFilter === 'Barberías') return BARBER_DIRECTORY.filter((e) => e.category === 'barberia');
  if (categoryFilter === 'Salud') return BARBER_DIRECTORY.filter((e) => e.category === 'salud');
  if (categoryFilter === 'Atención') return BARBER_DIRECTORY.filter((e) => e.category === 'atencion_cliente');
  return BARBER_DIRECTORY;
}

export function searchBusinesses(query: string, categoryFilter: CategoryFilter = 'Todos'): BarberDirectoryEntry[] {
  const normalized = query.trim().toLowerCase();
  const list = businessesByCategory(categoryFilter);
  if (!normalized) return list;
  return list.filter((item) =>
    item.name.toLowerCase().includes(normalized) ||
    item.code.toLowerCase().includes(normalized) ||
    item.district.toLowerCase().includes(normalized) ||
    item.categoryLabel.toLowerCase().includes(normalized)
  );
}

export function barberAvailableCount(entry: BarberDirectoryEntry): number {
  return entry.catalog.barbers.filter((item) => item.operationalState === 'disponible').length;
}

export function barberServiceMinPrice(entry: BarberDirectoryEntry): number | null {
  const prices = entry.catalog.services
    .map((item) => item.referencePriceCents)
    .filter((value): value is number => value !== null);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}
