-- Migration 0062: Escalabilidad multirrubro para colas virtuales y remotas.
-- Permite que empresas pertenezcan a diversos sectores (barberia, salud, atencion_cliente, general)
-- y expone un RPC público y liviano para listar negocios disponibles a clientes sin cuenta.

-- 1. Campos aditivos en empresas
alter table public.empresas
  add column if not exists rubro text not null default 'barberia',
  add column if not exists etiqueta_atendedor text not null default 'Profesional',
  add column if not exists descripcion text;

-- Restricción de verificación para rubros estándar
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'empresas_rubro_ck'
  ) then
    alter table public.empresas
      add constraint empresas_rubro_ck
      check (rubro in ('barberia', 'salud', 'atencion_cliente', 'gastronomia', 'retail', 'general'));
  end if;
end;
$$;

create index if not exists empresas_rubro_abierta_idx on public.empresas (rubro, abierta);

-- 2. RPC público y seguro para listar empresas disponibles
create or replace function public.listar_empresas_publicas(
  p_busqueda text default null,
  p_rubro text default null,
  p_limit integer default 30
)
returns table (
  id uuid,
  nombre text,
  codigo text,
  rubro text,
  abierta boolean,
  etiqueta_atendedor text,
  descripcion text,
  latitud double precision,
  longitud double precision,
  direccion text,
  en_espera_total integer
)
language sql
security definer
set search_path = ''
as $$
  select
    e.id,
    e.nombre,
    e.codigo,
    e.rubro,
    e.abierta,
    e.etiqueta_atendedor,
    e.descripcion,
    e.latitud,
    e.longitud,
    e.direccion,
    coalesce((
      select sum(f.en_espera)::integer
      from public.filas as f
      where f.empresa_id = e.id
    ), 0) as en_espera_total
  from public.empresas as e
  where
    (p_rubro is null or p_rubro = 'todos' or e.rubro = lower(btrim(p_rubro)))
    and (
      p_busqueda is null
      or btrim(p_busqueda) = ''
      or e.nombre ilike '%' || btrim(p_busqueda) || '%'
      or e.codigo ilike '%' || btrim(p_busqueda) || '%'
    )
  order by
    e.abierta desc,
    e.nombre asc
  limit greatest(1, least(coalesce(p_limit, 30), 100));
$$;

revoke all on function public.listar_empresas_publicas(text, text, integer) from public;
grant execute on function public.listar_empresas_publicas(text, text, integer) to anon, authenticated;
