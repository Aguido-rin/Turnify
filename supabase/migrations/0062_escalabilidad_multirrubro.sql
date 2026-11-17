-- 0062_escalabilidad_multirrubro.sql
-- Agrega soporte multirrubro aditivo y descubrimiento público seguro para clientes.

alter table public.empresas
  add column if not exists rubro text not null default 'general',
  add column if not exists etiqueta_atendedor text not null default 'Profesional',
  add column if not exists descripcion text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'empresas_rubro_check'
  ) then
    alter table public.empresas
      add constraint empresas_rubro_check
      check (rubro in ('barberia', 'salud', 'atencion_cliente', 'gastronomia', 'retail', 'general'));
  end if;
end $$;

create index if not exists idx_empresas_rubro_abierta
  on public.empresas (rubro, abierta);

-- RPC público para listar/buscar empresas sin exponer métricas internas ni IDs de personal
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
  etiqueta_atendedor text,
  descripcion text,
  abierta boolean,
  direccion text,
  latitud double precision,
  longitud double precision
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_search text;
  v_rubro text;
  v_limit integer;
begin
  v_limit := greatest(1, least(coalesce(p_limit, 30), 50));
  v_rubro := nullif(lower(trim(coalesce(p_rubro, ''))), '');

  if p_busqueda is not null and trim(p_busqueda) <> '' then
    v_search := '%' || replace(replace(replace(lower(trim(p_busqueda)), '\', '\\'), '%', '\%'), '_', '\_') || '%';
  else
    v_search := null;
  end if;

  return query
  select
    e.id,
    e.nombre,
    e.codigo,
    e.rubro,
    e.etiqueta_atendedor,
    e.descripcion,
    e.abierta,
    e.direccion,
    e.latitud,
    e.longitud
  from public.empresas e
  where
    (v_rubro is null or v_rubro = 'all' or e.rubro = v_rubro)
    and (
      v_search is null
      or lower(e.nombre) like v_search escape '\'
      or lower(e.codigo) like v_search escape '\'
      or lower(coalesce(e.direccion, '')) like v_search escape '\'
    )
  order by e.abierta desc, e.nombre asc
  limit v_limit;
end;
$$;

revoke all on function public.listar_empresas_publicas(text, text, integer) from public;
grant execute on function public.listar_empresas_publicas(text, text, integer) to anon, authenticated;

-- RPC ligero para resolver metadatos de rubro cuando el cliente entra por QR o código directo
create or replace function public.obtener_perfil_publico_empresa(
  p_codigo text
)
returns table (
  id uuid,
  nombre text,
  codigo text,
  rubro text,
  etiqueta_atendedor text,
  descripcion text,
  abierta boolean
)
language sql
security definer
set search_path = public
as $$
  select
    e.id,
    e.nombre,
    e.codigo,
    e.rubro,
    e.etiqueta_atendedor,
    e.descripcion,
    e.abierta
  from public.empresas e
  where upper(trim(e.codigo)) = upper(trim(coalesce(p_codigo, '')))
  limit 1;
$$;

revoke all on function public.obtener_perfil_publico_empresa(text) from public;
grant execute on function public.obtener_perfil_publico_empresa(text) to anon, authenticated;