-- =====================================================================
-- Migración 002 — Aprobación de docentes por el administrador
-- Ejecutar UNA vez en Supabase > SQL Editor (es seguro repetirla).
--
-- · Las cuentas nuevas de DOCENTE quedan pendientes hasta que un
--   administrador las aprueba desde la sección "Administración".
-- · Mientras están pendientes pueden iniciar sesión, pero NO pueden crear aulas.
-- · Las cuentas de FAMILIA se aprueban solas.
-- =====================================================================

-- Columna nueva; las cuentas que ya existían quedan aprobadas (solo la primera vez).
do $$ begin
  if not exists (select 1 from information_schema.columns
                 where table_schema = 'public' and table_name = 'perfiles' and column_name = 'aprobado') then
    alter table public.perfiles add column aprobado boolean not null default false;
    update public.perfiles set aprobado = true;
  end if;
end $$;

-- Perfil automático al registrarse: familia aprobada, docente pendiente.
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_rol text := case when new.raw_user_meta_data->>'rol' = 'docente' then 'docente' else 'familia' end;
begin
  insert into public.perfiles (id, nombre, rol, aprobado)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'nombre', ''), 60), v_rol, v_rol <> 'docente')
  on conflict (id) do nothing;
  return new;
end $$;

-- Solo docentes aprobados crean aulas.
drop policy if exists aulas_crear on public.aulas;
create policy aulas_crear on public.aulas for insert with check (
  docente_id = auth.uid()
  and exists (select 1 from public.perfiles where id = auth.uid() and rol = 'docente' and aprobado));

-- Lista de docentes pendientes (con su correo), solo para administradores.
create or replace function public.docentes_pendientes()
returns table (id uuid, nombre text, correo text, creado timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'solo_admin'; end if;
  return query
    select p.id, p.nombre, u.email::text, p.creado
    from public.perfiles p join auth.users u on u.id = p.id
    where p.rol = 'docente' and not p.aprobado
    order by p.creado;
end $$;

-- Aprobar (true) o rechazar (false). Rechazar convierte la cuenta en "familia".
create or replace function public.aprobar_docente(p_id uuid, p_aprobar boolean)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'solo_admin'; end if;
  if p_aprobar then
    update public.perfiles set aprobado = true where id = p_id;
  else
    update public.perfiles set rol = 'familia', aprobado = true where id = p_id;
  end if;
end $$;

grant execute on function public.docentes_pendientes() to authenticated;
grant execute on function public.aprobar_docente(uuid, boolean) to authenticated;

-- Comprobación: debe listar tu cuenta con aprobado = true.
select u.email, p.rol, p.aprobado from public.perfiles p join auth.users u on u.id = p.id;
