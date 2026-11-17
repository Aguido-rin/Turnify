import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const migration = readFileSync(
  join(root, 'supabase', 'migrations', '0062_escalabilidad_multirrubro.sql'),
  'utf8',
);

describe('escalabilidad multirrubro migration contract', () => {
  it('adds rubro and etiqueta_atendedor columns to empresas', () => {
    expect(migration).toContain('rubro');
    expect(migration).toContain('etiqueta_atendedor');
    expect(migration).toMatch(/rubro\s+text\s+not\s+null\s+default\s+'barberia'/i);
  });

  it('validates supported sectors in empresas_rubro_ck constraint', () => {
    expect(migration).toContain('empresas_rubro_ck');
    expect(migration).toContain('barberia');
    expect(migration).toContain('salud');
    expect(migration).toContain('atencion_cliente');
  });

  it('defines the lightweight public discovery RPC listar_empresas_publicas', () => {
    expect(migration).toContain('create or replace function public.listar_empresas_publicas');
    expect(migration).toContain('returns table');
    expect(migration).toContain('en_espera_total');
  });

  it('grants execution of listar_empresas_publicas to anon and authenticated users', () => {
    expect(migration).toMatch(/grant execute on function public\.listar_empresas_publicas[^\n;]*to anon, authenticated;/i);
  });
});
