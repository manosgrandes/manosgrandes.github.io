-- =====================================================================
-- Manos Grandes Dientes Chiquitos — esquema para Supabase (plan gratuito)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run.
-- Es seguro volver a ejecutarlo (usa IF NOT EXISTS / OR REPLACE).
--
-- Principios:
--  * Los niños NO tienen cuenta ni datos personales: solo un apodo dentro de
--    un aula. Sus resultados entran por la función registrar_progreso().
--  * Docentes y familias tienen cuenta (correo + contraseña).
--  * Los administradores se agregan a mano en la tabla "admins".
--  * Todas las tablas tienen RLS activado.
-- =====================================================================

-- ---------- Perfiles de adultos ----------
create table if not exists public.perfiles (
  id uuid primary key references auth.users on delete cascade,
  nombre text not null default '',
  rol text not null default 'familia' check (rol in ('docente', 'familia')),
  creado timestamptz not null default now()
);

create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'nombre', ''), 60),
    case when new.raw_user_meta_data->>'rol' = 'docente' then 'docente' else 'familia' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- ---------- Administradores ----------
-- Para volver administrador a alguien (después de que cree su cuenta):
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'correo@ejemplo.com';
create table if not exists public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Aulas, estudiantes y progreso ----------
create table if not exists public.aulas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^[A-Z0-9]{6}$'),
  nombre text not null check (char_length(nombre) between 1 and 80),
  docente_id uuid not null default auth.uid() references auth.users on delete cascade,
  creado timestamptz not null default now()
);

create table if not exists public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references public.aulas on delete cascade,
  apodo text not null check (char_length(apodo) between 1 and 20),
  creado timestamptz not null default now(),
  unique (aula_id, apodo)
);

create table if not exists public.progreso (
  id bigint generated always as identity primary key,
  estudiante_id uuid not null references public.estudiantes on delete cascade,
  actividad text not null check (char_length(actividad) <= 80),
  puntaje int not null check (puntaje between 0 and 100000),
  estrellas int not null check (estrellas between 0 and 3),
  fecha timestamptz not null default now()
);
create index if not exists progreso_estudiante_idx on public.progreso (estudiante_id);

-- Nombre de un aula a partir de su código (para que el niño confirme que se unió bien).
create or replace function public.nombre_aula(p_codigo text) returns text
language sql stable security definer set search_path = public as $$
  select nombre from public.aulas where codigo = upper(p_codigo);
$$;

-- Registro de resultados de niños sin cuenta (llamado desde el navegador).
create or replace function public.registrar_progreso(
  p_codigo text, p_apodo text, p_actividad text, p_puntaje int, p_estrellas int, p_fecha timestamptz default now()
) returns void
language plpgsql security definer set search_path = public as $$
declare v_aula uuid; v_est uuid;
begin
  select id into v_aula from public.aulas where codigo = upper(p_codigo);
  if v_aula is null then raise exception 'aula_no_existe'; end if;

  insert into public.estudiantes (aula_id, apodo) values (v_aula, left(trim(p_apodo), 20))
  on conflict (aula_id, apodo) do update set apodo = excluded.apodo
  returning id into v_est;

  insert into public.progreso (estudiante_id, actividad, puntaje, estrellas, fecha)
  values (v_est, left(p_actividad, 80), greatest(0, least(p_puntaje, 100000)), greatest(0, least(p_estrellas, 3)),
          least(coalesce(p_fecha, now()), now()));
end $$;

-- Ranking del aula: suma de la mejor marca de estrellas por actividad.
create or replace function public.ranking_aula(p_codigo text)
returns table (apodo text, estrellas bigint)
language sql stable security definer set search_path = public as $$
  select e.apodo, coalesce(sum(m.mejor), 0) as estrellas
  from public.estudiantes e
  join public.aulas a on a.id = e.aula_id and a.codigo = upper(p_codigo)
  left join lateral (
    select max(p.estrellas) as mejor from public.progreso p
    where p.estudiante_id = e.id group by p.actividad
  ) m on true
  group by e.apodo
  order by estrellas desc, e.apodo
  limit 50;
$$;

-- ---------- Cuentos (biblioteca compartida) ----------
create table if not exists public.cuentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null check (char_length(titulo) between 1 and 120),
  autor_texto text not null default '',
  edad text not null default '',
  tema text not null default 'otro',
  licencia text not null check (char_length(licencia) between 1 and 200),
  video_url text,
  portada text,
  paginas jsonb not null default '[]'::jsonb,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  subido_por uuid not null default auth.uid() references auth.users on delete cascade,
  creado timestamptz not null default now()
);

-- ---------- Foro de familias y docentes ----------
create table if not exists public.foro_temas (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references auth.users on delete cascade,
  autor_nombre text not null default '',
  categoria text not null default 'general',
  titulo text not null check (char_length(titulo) between 3 and 140),
  cuerpo text not null check (char_length(cuerpo) between 1 and 5000),
  oculto boolean not null default false,
  reportes int not null default 0,
  creado timestamptz not null default now()
);

create table if not exists public.foro_respuestas (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references public.foro_temas on delete cascade,
  autor_id uuid not null default auth.uid() references auth.users on delete cascade,
  autor_nombre text not null default '',
  cuerpo text not null check (char_length(cuerpo) between 1 and 3000),
  oculto boolean not null default false,
  reportes int not null default 0,
  creado timestamptz not null default now()
);

create or replace function public.reportar(p_tabla text, p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'requiere_cuenta'; end if;
  if p_tabla = 'foro_temas' then
    update public.foro_temas set reportes = reportes + 1 where id = p_id;
  elsif p_tabla = 'foro_respuestas' then
    update public.foro_respuestas set reportes = reportes + 1 where id = p_id;
  end if;
end $$;

-- ---------- Contacto ----------
create table if not exists public.contacto (
  id bigint generated always as identity primary key,
  nombre text not null check (char_length(nombre) between 1 and 80),
  correo text not null check (char_length(correo) between 3 and 120),
  perfil text not null default '',
  mensaje text not null check (char_length(mensaje) between 1 and 3000),
  boletin boolean not null default false,
  creado timestamptz not null default now()
);

-- ---------- Estadísticas para el administrador ----------
create or replace function public.estadisticas_generales() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.es_admin() then raise exception 'solo_admin'; end if;
  return json_build_object(
    'docentes', (select count(*) from public.perfiles where rol = 'docente'),
    'familias', (select count(*) from public.perfiles where rol = 'familia'),
    'aulas', (select count(*) from public.aulas),
    'estudiantes', (select count(*) from public.estudiantes),
    'partidas', (select count(*) from public.progreso),
    'cuentos', (select count(*) from public.cuentos where estado = 'aprobado'),
    'por_actividad', (select coalesce(json_object_agg(actividad, n), '{}'::json)
                      from (select actividad, count(*) n from public.progreso group by actividad) t)
  );
end $$;

-- =====================================================================
-- Seguridad a nivel de fila (RLS)
-- =====================================================================
alter table public.perfiles enable row level security;
alter table public.admins enable row level security;
alter table public.aulas enable row level security;
alter table public.estudiantes enable row level security;
alter table public.progreso enable row level security;
alter table public.cuentos enable row level security;
alter table public.foro_temas enable row level security;
alter table public.foro_respuestas enable row level security;
alter table public.contacto enable row level security;

-- Permisos base del API (las filas visibles las deciden las políticas RLS de abajo).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
revoke all on public.admins from anon, authenticated;

-- Perfiles: cada quien ve y edita el suyo (el rol no se puede cambiar desde el navegador).
drop policy if exists perfiles_ver on public.perfiles;
create policy perfiles_ver on public.perfiles for select using (id = auth.uid() or public.es_admin());
drop policy if exists perfiles_editar on public.perfiles;
create policy perfiles_editar on public.perfiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.perfiles from anon, authenticated;
grant update (nombre) on public.perfiles to authenticated;

-- Admins: nadie la lee ni escribe desde el navegador (solo es_admin()).

-- Aulas: solo docentes, cada uno las suyas.
drop policy if exists aulas_ver on public.aulas;
create policy aulas_ver on public.aulas for select using (docente_id = auth.uid() or public.es_admin());
drop policy if exists aulas_crear on public.aulas;
create policy aulas_crear on public.aulas for insert with check (
  docente_id = auth.uid() and exists (select 1 from public.perfiles where id = auth.uid() and rol = 'docente'));
drop policy if exists aulas_editar on public.aulas;
create policy aulas_editar on public.aulas for update using (docente_id = auth.uid());
drop policy if exists aulas_borrar on public.aulas;
create policy aulas_borrar on public.aulas for delete using (docente_id = auth.uid());

-- Estudiantes y progreso: los ve el docente dueño del aula (entran por registrar_progreso).
drop policy if exists estudiantes_ver on public.estudiantes;
create policy estudiantes_ver on public.estudiantes for select using (
  exists (select 1 from public.aulas a where a.id = aula_id and a.docente_id = auth.uid()) or public.es_admin());
drop policy if exists estudiantes_borrar on public.estudiantes;
create policy estudiantes_borrar on public.estudiantes for delete using (
  exists (select 1 from public.aulas a where a.id = aula_id and a.docente_id = auth.uid()));
drop policy if exists progreso_ver on public.progreso;
create policy progreso_ver on public.progreso for select using (
  exists (select 1 from public.estudiantes e join public.aulas a on a.id = e.aula_id
          where e.id = estudiante_id and a.docente_id = auth.uid()) or public.es_admin());

-- Cuentos: todos ven los aprobados; el autor ve los suyos; el admin ve y modera todo.
drop policy if exists cuentos_ver on public.cuentos;
create policy cuentos_ver on public.cuentos for select using (
  estado = 'aprobado' or subido_por = auth.uid() or public.es_admin());
drop policy if exists cuentos_crear on public.cuentos;
create policy cuentos_crear on public.cuentos for insert to authenticated with check (
  subido_por = auth.uid() and (estado = 'pendiente' or public.es_admin()));
drop policy if exists cuentos_moderar on public.cuentos;
create policy cuentos_moderar on public.cuentos for update using (public.es_admin());
drop policy if exists cuentos_borrar on public.cuentos;
create policy cuentos_borrar on public.cuentos for delete using (subido_por = auth.uid() or public.es_admin());

-- Foro: lectura pública de lo no oculto; escriben adultos con cuenta; el admin oculta.
drop policy if exists temas_ver on public.foro_temas;
create policy temas_ver on public.foro_temas for select using (not oculto or public.es_admin());
drop policy if exists temas_crear on public.foro_temas;
create policy temas_crear on public.foro_temas for insert to authenticated with check (autor_id = auth.uid() and not oculto and reportes = 0);
drop policy if exists temas_moderar on public.foro_temas;
create policy temas_moderar on public.foro_temas for update using (public.es_admin());
drop policy if exists temas_borrar on public.foro_temas;
create policy temas_borrar on public.foro_temas for delete using (autor_id = auth.uid() or public.es_admin());

drop policy if exists resp_ver on public.foro_respuestas;
create policy resp_ver on public.foro_respuestas for select using (not oculto or public.es_admin());
drop policy if exists resp_crear on public.foro_respuestas;
create policy resp_crear on public.foro_respuestas for insert to authenticated with check (autor_id = auth.uid() and not oculto and reportes = 0);
drop policy if exists resp_moderar on public.foro_respuestas;
create policy resp_moderar on public.foro_respuestas for update using (public.es_admin());
drop policy if exists resp_borrar on public.foro_respuestas;
create policy resp_borrar on public.foro_respuestas for delete using (autor_id = auth.uid() or public.es_admin());

-- Contacto: cualquiera envía; solo el admin lee y borra.
drop policy if exists contacto_enviar on public.contacto;
create policy contacto_enviar on public.contacto for insert to anon, authenticated with check (true);
drop policy if exists contacto_ver on public.contacto;
create policy contacto_ver on public.contacto for select using (public.es_admin());
drop policy if exists contacto_borrar on public.contacto;
create policy contacto_borrar on public.contacto for delete using (public.es_admin());

-- Funciones públicas para niños sin cuenta.
grant execute on function public.nombre_aula(text) to anon, authenticated;
grant execute on function public.registrar_progreso(text, text, text, int, int, timestamptz) to anon, authenticated;
grant execute on function public.ranking_aula(text) to anon, authenticated;

-- =====================================================================
-- Almacenamiento de imágenes de cuentos (bucket público de solo lectura)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cuentos', 'cuentos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists cuentos_subir on storage.objects;
create policy cuentos_subir on storage.objects for insert to authenticated with check (
  bucket_id = 'cuentos' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists cuentos_borrar_archivos on storage.objects;
create policy cuentos_borrar_archivos on storage.objects for delete to authenticated using (
  bucket_id = 'cuentos' and ((storage.foldername(name))[1] = auth.uid()::text or public.es_admin()));
