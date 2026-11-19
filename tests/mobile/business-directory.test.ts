import { describe, expect, it } from 'vitest';
import {
  BUSINESS_DIRECTORY,
  findDirectoryBusinessByCode,
  getBusinessCategoryLabel,
  getSelectStaffTitle,
  getStaffRoleLabel,
  searchBusinesses,
} from '../../apps/mobile/src/features/customer/business-directory';

describe('business-directory multirrubro', () => {
  it('expone 1 barbería demo y 2 rubros adicionales (salud y atención)', () => {
    expect(BUSINESS_DIRECTORY).toHaveLength(3);
    expect(BUSINESS_DIRECTORY.map((b) => b.category)).toEqual([
      'barberia',
      'salud',
      'atencion_cliente',
    ]);
  });

  it('adapta etiquetas dinámicas según el rubro del negocio', () => {
    expect(getStaffRoleLabel('salud')).toBe('Médico');
    expect(getSelectStaffTitle('atencion_cliente')).toBe('Elige tu asesor');
    expect(getStaffRoleLabel('salud', 'Odontólogo')).toBe('Odontólogo');
    expect(getBusinessCategoryLabel('gastronomia')).toBe('Restaurante');
  });

  it('filtra por categoría y encuentra negocios por código', () => {
    expect(searchBusinesses('', 'Salud')[0]?.code).toBe('CLINICA-DEMO');
    expect(findDirectoryBusinessByCode('tramites-demo')?.requiresSpecificStaff).toBe(false);
  });
});