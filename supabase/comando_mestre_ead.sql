-- FRASE FINAL DE CONTROLE
-- “Todo o sistema deve respeitar rigorosamente a hierarquia institucional, permissões de usuários e vínculos obrigatórios, garantindo segurança, rastreabilidade e integridade total dos dados no Supabase.”

-- EXTENSÕES
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- PERFIS (ligado ao Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role text not null check (role in ('SUPER_ADMIN','ADMIN_POLO','ADMIN_NUCLEO','COORDENADOR','PROFESSOR','ALUNO')),
  ativo boolean default true,
  created_at timestamptz default now()
);
alter table public.profiles add column if not exists deleted_at timestamptz;

-- PAPÉIS ESCOPADOS (escopo hierárquico)
create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('SUPER_ADMIN','ADMIN_POLO','ADMIN_NUCLEO','COORDENADOR','PROFESSOR','ALUNO')),
  active boolean not null default true,
  polo_id uuid,
  nucleo_id uuid,
  curso_id uuid,
  created_at timestamptz default now(),
  primary key (user_id, role, coalesce(polo_id, gen_random_uuid()), coalesce(nucleo_id, gen_random_uuid()), coalesce(curso_id, gen_random_uuid()))
);

-- SUPER_ADMIN mestre (não deletável, apenas desativável)
create table if not exists public.master_super_admin (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- BLOQUEIO DE EXCLUSÃO DE SUPER_ADMIN
create or replace function public.block_delete_super_admin()
returns trigger language plpgsql as $$
begin
  if old.role = 'SUPER_ADMIN' then
    raise exception 'SUPER_ADMIN não pode ser excluído. Desative via active=false.';
  end if;
  return old;
end; $$;

drop trigger if exists trg_block_delete_super_admin on public.user_roles;
create trigger trg_block_delete_super_admin
before delete on public.user_roles
for each row execute procedure public.block_delete_super_admin();

-- HIERARQUIA: POLOS, NÚCLEOS
create table if not exists public.polos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  codigo text unique not null,
  status boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.nucleos (
  id uuid primary key default uuid_generate_v4(),
  polo_id uuid not null references public.polos(id) on delete cascade,
  nome text not null,
  status boolean default true,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- CURSOS
create table if not exists public.cursos (
  id uuid primary key default uuid_generate_v4(),
  polo_id uuid not null references public.polos(id) on delete restrict,
  nucleo_id uuid not null references public.nucleos(id) on delete restrict,
  nome text not null,
  descricao text,
  carga_horaria int not null,
  status boolean default true,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- MÓDULOS
create table if not exists public.modulos (
  id uuid primary key default uuid_generate_v4(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  titulo text not null,
  ordem int default 1,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- AULAS / CONTEÚDOS
create table if not exists public.aulas (
  id uuid primary key default uuid_generate_v4(),
  modulo_id uuid not null references public.modulos(id) on delete cascade,
  titulo text not null,
  descricao text,
  video_url text,
  material_pdf text,
  material_word text,
  material_ppt text,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- PROVAS
create table if not exists public.provas (
  id uuid primary key default uuid_generate_v4(),
  modulo_id uuid not null references public.modulos(id) on delete cascade,
  titulo text not null,
  tipo text check (tipo in ('OBJETIVA','DISCURSIVA','MISTA')),
  nota_minima numeric default 7.0,
  tentativas int default 1,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

-- QUESTÕES
create table if not exists public.questoes (
  id uuid primary key default uuid_generate_v4(),
  prova_id uuid not null references public.provas(id) on delete cascade,
  pergunta text not null,
  tipo text check (tipo in ('MULTIPLA_ESCOLHA','DISCURSIVA')),
  created_at timestamptz default now()
);

-- ALTERNATIVAS
create table if not exists public.alternativas (
  id uuid primary key default uuid_generate_v4(),
  questao_id uuid not null references public.questoes(id) on delete cascade,
  texto text not null,
  correta boolean default false
);

-- MATRÍCULAS
create table if not exists public.matriculas (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  curso_id uuid not null references public.cursos(id) on delete cascade,
  status text default 'ATIVO',
  created_at timestamptz default now()
);

-- RESULTADOS DE PROVAS
create table if not exists public.resultados (
  id uuid primary key default uuid_generate_v4(),
  prova_id uuid not null references public.provas(id) on delete cascade,
  aluno_id uuid not null references public.profiles(id) on delete cascade,
  nota numeric,
  status text default 'PENDENTE' check (status in ('PENDENTE','APROVADO','REPROVADO')),
  created_at timestamptz default now()
);

-- FUNÇÃO: status por nota mínima
create or replace function public.set_resultado_status()
returns trigger language plpgsql as $$
declare min numeric;
begin
  select nota_minima into min from public.provas where id = new.prova_id;
  if new.nota is not null then
    if new.nota >= min then new.status := 'APROVADO'; else new.status := 'REPROVADO'; end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_set_resultado_status on public.resultados;
create trigger trg_set_resultado_status
before insert or update on public.resultados
for each row execute procedure public.set_resultado_status();

-- AUDITORIA
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  table_name text not null,
  action text not null,
  record_id uuid,
  payload jsonb,
  created_at timestamptz default now()
);

create or replace function public.audit_log()
returns trigger language plpgsql as $$
declare actor uuid := auth.uid();
begin
  if (tg_op = 'INSERT') then
    insert into public.audit_logs (user_id, table_name, action, record_id, payload)
    values (actor, tg_table_name, 'INSERT', new.id, to_jsonb(new));
    return new;
  elsif (tg_op = 'UPDATE') then
    insert into public.audit_logs (user_id, table_name, action, record_id, payload)
    values (actor, tg_table_name, 'UPDATE', new.id, jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
    return new;
  elsif (tg_op = 'DELETE') then
    insert into public.audit_logs (user_id, table_name, action, record_id, payload)
    values (actor, tg_table_name, 'DELETE', old.id, to_jsonb(old));
    return old;
  end if;
  return null;
end; $$;

-- SOFT DELETE (Regra: converter DELETE em set deleted_at)
create or replace function public.soft_delete()
returns trigger language plpgsql as $$
begin
  execute format('update %I set deleted_at = now() where id = $1', tg_table_name) using old.id;
  return null;
end; $$;

-- Triggers de auditoria e soft delete
do $$
begin
  perform 1;
  for table_name in select unnest(array['profiles','polos','nucleos','cursos','modulos','aulas','provas']) loop
    execute format('drop trigger if exists trg_audit_%I_ins on public.%I', table_name, table_name);
    execute format('drop trigger if exists trg_audit_%I_upd on public.%I', table_name, table_name);
    execute format('drop trigger if exists trg_audit_%I_del on public.%I', table_name, table_name);
    execute format('create trigger trg_audit_%I_ins after insert on public.%I for each row execute procedure public.audit_log()', table_name, table_name);
    execute format('create trigger trg_audit_%I_upd after update on public.%I for each row execute procedure public.audit_log()', table_name, table_name);
    execute format('create trigger trg_audit_%I_del after delete on public.%I for each row execute procedure public.audit_log()', table_name, table_name);
    execute format('drop trigger if exists trg_soft_delete_%I on public.%I', table_name, table_name);
    execute format('create trigger trg_soft_delete_%I before delete on public.%I for each row execute procedure public.soft_delete()', table_name, table_name);
  end loop;
end $$;

create or replace function public.audit_user_roles()
returns trigger language plpgsql as $$
declare actor uuid := auth.uid();
declare action text;
begin
  if tg_op = 'INSERT' then action := 'ROLE_ADD';
  elsif tg_op = 'UPDATE' then action := 'ROLE_UPDATE';
  elsif tg_op = 'DELETE' then action := 'ROLE_REMOVE';
  end if;
  if tg_op = 'DELETE' then
    insert into public.audit_logs (user_id, table_name, action, record_id, payload)
    values (actor, 'user_roles', action, old.user_id, jsonb_build_object('old', to_jsonb(old)));
    return old;
  else
    insert into public.audit_logs (user_id, table_name, action, record_id, payload)
    values (actor, 'user_roles', action, new.user_id, jsonb_build_object('new', to_jsonb(new), 'role', new.role));
    return new;
  end if;
end; $$;

drop trigger if exists trg_audit_user_roles_ins on public.user_roles;
drop trigger if exists trg_audit_user_roles_upd on public.user_roles;
drop trigger if exists trg_audit_user_roles_del on public.user_roles;
create trigger trg_audit_user_roles_ins after insert on public.user_roles for each row execute procedure public.audit_user_roles();
create trigger trg_audit_user_roles_upd after update on public.user_roles for each row execute procedure public.audit_user_roles();
create trigger trg_audit_user_roles_del after delete on public.user_roles for each row execute procedure public.audit_user_roles();

-- Funções de checagem de escopo
create or replace function public.is_super_admin() returns boolean stable language sql as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'SUPER_ADMIN' and active = true);
$$;

create or replace function public.has_admin_polo(p uuid) returns boolean stable language sql as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'ADMIN_POLO' and polo_id = p and active = true);
$$;

create or replace function public.has_admin_nucleo(n uuid) returns boolean stable language sql as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'ADMIN_NUCLEO' and nucleo_id = n and active = true);
$$;

create or replace function public.has_coordenador_curso(c uuid) returns boolean stable language sql as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'COORDENADOR' and curso_id = c and active = true);
$$;

create or replace function public.has_professor_curso(c uuid) returns boolean stable language sql as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'PROFESSOR' and curso_id = c and active = true);
$$;

create or replace function public.is_aluno_curso(c uuid) returns boolean stable language sql as $$
  select exists (select 1 from public.matriculas where aluno_id = auth.uid() and curso_id = c and status = 'ATIVO');
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.master_super_admin enable row level security;
alter table public.polos enable row level security;
alter table public.nucleos enable row level security;
alter table public.cursos enable row level security;
alter table public.modulos enable row level security;
alter table public.aulas enable row level security;
alter table public.provas enable row level security;
alter table public.questoes enable row level security;
alter table public.alternativas enable row level security;
alter table public.matriculas enable row level security;
alter table public.resultados enable row level security;
alter table public.audit_logs enable row level security;

-- Perfis: próprio; SUPER_ADMIN vê todos
create policy profiles_select on public.profiles
  for select using (deleted_at is null and (id = auth.uid() or is_super_admin()));

create policy profiles_update_self on public.profiles
  for update using (deleted_at is null and id = auth.uid());

create policy profiles_insert_admin on public.profiles
  for insert with check (is_super_admin());

-- user_roles: gestão apenas por SUPER_ADMIN; leitura própria
create policy roles_select on public.user_roles
  for select using (user_id = auth.uid() or is_super_admin());
create policy roles_all on public.user_roles
  for all using (is_super_admin());

-- master_super_admin: somente SUPER_ADMIN
create policy msa_all on public.master_super_admin for all using (is_super_admin());

-- Polos: sem acesso fora de escopo; ocultar soft delete
create policy polos_select on public.polos
  for select using (deleted_at is null and (is_super_admin() or has_admin_polo(id)));
create policy polos_manage on public.polos
  for all using (is_super_admin() or has_admin_polo(id));

-- Núcleos
create policy nucleos_select on public.nucleos
  for select using (deleted_at is null and (is_super_admin() or has_admin_polo(polo_id) or has_admin_nucleo(id)));
create policy nucleos_manage on public.nucleos
  for all using (is_super_admin() or has_admin_polo(polo_id) or has_admin_nucleo(id));

-- Cursos
create policy cursos_select on public.cursos
  for select using (deleted_at is null and (
    is_super_admin() or has_admin_polo(polo_id) or has_admin_nucleo(nucleo_id)
    or has_coordenador_curso(id) or has_professor_curso(id) or is_aluno_curso(id)
  ));
create policy cursos_manage on public.cursos
  for all using (is_super_admin() or has_admin_polo(polo_id) or has_admin_nucleo(nucleo_id));

-- Módulos
create policy modulos_select on public.modulos
  for select using (deleted_at is null and exists (
    select 1 from public.cursos c where c.id = curso_id and (
      is_super_admin() or has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id)
      or has_coordenador_curso(c.id) or has_professor_curso(c.id) or is_aluno_curso(c.id)
    )
  ));
create policy modulos_manage on public.modulos
  for all using (exists (
    select 1 from public.cursos c where c.id = curso_id and (
      is_super_admin() or has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id)
    )
  ));

-- Aulas
create policy aulas_select on public.aulas
  for select using (deleted_at is null and exists (
    select 1 from public.modulos m join public.cursos c on c.id = m.curso_id
    where m.id = modulo_id and (
      is_super_admin() or has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id)
      or has_coordenador_curso(c.id) or has_professor_curso(c.id) or is_aluno_curso(c.id)
    )
  ));
create policy aulas_manage on public.aulas
  for all using (exists (
    select 1 from public.modulos m join public.cursos c on c.id = m.curso_id
    where m.id = modulo_id and (
      is_super_admin() or has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id) or has_professor_curso(c.id)
    )
  ));

-- Provas, Questões, Alternativas
create policy provas_select on public.provas
  for select using (deleted_at is null and exists (
    select 1 from public.modulos m join public.cursos c on c.id = m.curso_id
    where m.id = modulo_id and (
      is_super_admin() or has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id)
      or has_coordenador_curso(c.id) or has_professor_curso(c.id) or is_aluno_curso(c.id)
    )
  ));
create policy provas_manage on public.provas
  for all using (exists (
    select 1 from public.modulos m join public.cursos c on c.id = m.curso_id
    where m.id = modulo_id and (
      is_super_admin() or has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id) or has_professor_curso(c.id)
    )
  ));

create policy questoes_select on public.questoes
  for select using (exists (
    select 1 from public.provas p join public.modulos m on m.id = p.modulo_id
    join public.cursos c on c.id = m.curso_id
    where p.id = prova_id and (
      is_super_admin() or has_professor_curso(c.id) or has_coordenador_curso(c.id) or is_aluno_curso(c.id)
    )
  ));
create policy questoes_manage on public.questoes
  for all using (exists (
    select 1 from public.provas p join public.modulos m on m.id = p.modulo_id
    join public.cursos c on c.id = m.curso_id
    where p.id = prova_id and (is_super_admin() or has_professor_curso(c.id) or has_coordenador_curso(c.id))
  ));

create policy alternativas_select on public.alternativas
  for select using (exists (select 1 from public.questoes q where q.id = questao_id));
create policy alternativas_manage on public.alternativas
  for all using (exists (
    select 1 from public.questoes q join public.provas p on p.id = q.prova_id
    join public.modulos m on m.id = p.modulo_id join public.cursos c on c.id = m.curso_id
    where q.id = questao_id and (is_super_admin() or has_professor_curso(c.id) or has_coordenador_curso(c.id))
  ));

-- Matrículas e Resultados
create policy matriculas_select on public.matriculas
  for select using (
    aluno_id = auth.uid() or is_super_admin() or exists (
      select 1 from public.cursos c where c.id = curso_id and (has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id))
    )
  );
create policy matriculas_manage on public.matriculas
  for all using (is_super_admin() or exists (
    select 1 from public.cursos c where c.id = curso_id and (has_admin_polo(c.polo_id) or has_admin_nucleo(c.nucleo_id))
  ));

create policy resultados_select on public.resultados
  for select using (
    aluno_id = auth.uid() or is_super_admin() or exists (
      select 1 from public.provas p join public.modulos m on m.id = p.modulo_id join public.cursos c on c.id = m.curso_id
      where p.id = prova_id and (has_professor_curso(c.id) or has_coordenador_curso(c.id))
    )
  );
create policy resultados_manage on public.resultados
  for all using (is_super_admin() or exists (
    select 1 from public.provas p join public.modulos m on m.id = p.modulo_id join public.cursos c on c.id = m.curso_id
    where p.id = prova_id and (has_professor_curso(c.id) or has_coordenador_curso(c.id))
  ));

-- Audit logs: somente SUPER_ADMIN
create policy audit_logs_select on public.audit_logs
  for select using (is_super_admin());
create policy audit_logs_insert on public.audit_logs
  for insert with check (true);
create policy audit_logs_update on public.audit_logs
  for update using (is_super_admin());
create policy audit_logs_delete on public.audit_logs
  for delete using (is_super_admin());

-- INSTRUÇÕES DE PROVISIONAMENTO
-- 1) Criar SUPER_ADMIN:
--   insert into public.profiles (id, nome, role) values ('<AUTH_USER_ID>'::uuid, 'Super Admin', 'SUPER_ADMIN')
--   on conflict (id) do update set role = excluded.role, ativo = true;
--   insert into public.user_roles (user_id, role, active) values ('<AUTH_USER_ID>'::uuid, 'SUPER_ADMIN', true) on conflict do nothing;
--   insert into public.master_super_admin (user_id, active) values ('<AUTH_USER_ID>'::uuid, true)
--   on conflict (user_id) do update set active = excluded.active;

-- 2) Soft delete: use DELETE normalmente; será convertido para deleted_at automaticamente.

create or replace function public.criar_profile_padrao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, role, ativo)
  values (new.id, coalesce(new.email, 'Usuário'), 'ALUNO', true)
  on conflict (id) do update
  set nome = excluded.nome,
      role = 'ALUNO',
      ativo = true;
  insert into public.audit_logs (user_id, table_name, action, record_id, payload)
  values (new.id, 'profiles', 'AUTO_CREATE', new.id, jsonb_build_object('email', new.email));
  return new;
end;
$$;

drop trigger if exists trg_criar_profile_padrao on auth.users;
create trigger trg_criar_profile_padrao
after insert on auth.users
for each row execute function public.criar_profile_padrao();
