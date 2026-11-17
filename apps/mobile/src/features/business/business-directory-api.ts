import { getSupabase } from '../../lib/supabase';
import {
  BUSINESS_DIRECTORY,
  BusinessDirectoryEntry,
  CategoryFilter,
  categoryFilterToSlug,
  getBusinessCategoryLabel,
  getStaffRoleLabel,
  normalizeBusinessCategory,
  searchBusinesses,
} from '../customer/business-directory';

interface PublicBusinessRow {
  id: string;
  nombre: string;
  codigo: string;
  rubro: string;
  etiqueta_atendedor: string;
  descripcion: string | null;
  abierta: boolean;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
}

export async function listPublicBusinesses(params?: {
  query?: string;
  category?: CategoryFilter;
}): Promise<BusinessDirectoryEntry[]> {
  const query = params?.query ?? '';
  const category = params?.category ?? 'Todos';

  if (process.env.EXPO_PUBLIC_SKIP_AUTH === '1') {
    return searchBusinesses(query, category, BUSINESS_DIRECTORY);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return searchBusinesses(query, category, BUSINESS_DIRECTORY);
  }

  try {
    const { data, error } = await supabase.rpc('listar_empresas_publicas', {
      p_busqueda: query.trim() || null,
      p_rubro: categoryFilterToSlug(category),
      p_limit: 30,
    });

    if (error || !Array.isArray(data)) {
      return searchBusinesses(query, category, BUSINESS_DIRECTORY);
    }

    if (data.length === 0 && !query.trim()) {
      return searchBusinesses(query, category, BUSINESS_DIRECTORY);
    }

    return (data as PublicBusinessRow[]).map((row) => {
      const normalized = normalizeBusinessCategory(row.rubro);
      const isOpen = Boolean(row.abierta);
      return {
        businessId: row.id,
        code: row.codigo,
        name: row.nombre,
        district: row.direccion?.trim() || 'Ubicación disponible al ingresar',
        distanceKm: 1.0,
        etaMinutes: 15,
        isOpen,
        category: normalized,
        categoryLabel: getBusinessCategoryLabel(normalized),
        staffLabel: getStaffRoleLabel(normalized, row.etiqueta_atendedor),
        requiresSpecificStaff: normalized !== 'atencion_cliente' && normalized !== 'retail',
        catalog: {
          name: row.nombre,
          open: isOpen,
          services: [],
          barbers: [],
        },
      };
    });
  } catch {
    return searchBusinesses(query, category, BUSINESS_DIRECTORY);
  }
}

export async function fetchBusinessRubroContext(code: string): Promise<{
  category: ReturnType<typeof normalizeBusinessCategory>;
  staffLabel: string;
} | null> {
  const cleanCode = code.trim().toUpperCase();
  const demoMatch = BUSINESS_DIRECTORY.find((b) => b.code.toUpperCase() === cleanCode);
  if (demoMatch) {
    return {
      category: demoMatch.category,
      staffLabel: demoMatch.staffLabel,
    };
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.rpc('obtener_perfil_publico_empresa', {
      p_codigo: cleanCode,
    });
    if (error || !Array.isArray(data) || data.length === 0) return null;
    const row = data[0] as { rubro?: string; etiqueta_atendedor?: string };
    const normalized = normalizeBusinessCategory(row.rubro);
    return {
      category: normalized,
      staffLabel: getStaffRoleLabel(normalized, row.etiqueta_atendedor),
    };
  } catch {
    return null;
  }
}