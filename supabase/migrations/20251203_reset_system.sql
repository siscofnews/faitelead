-- Reset total do sistema via RPC com SECURITY DEFINER
-- Executa remoções em ordem segura e ignora RLS para admin/super_admin

create or replace function public.reset_system(
  _confirm boolean
)
returns void
language plpgsql
security definer
as $$
begin
  if _confirm is not true then
    raise exception 'confirmation required';
  end if;

  -- Verificar se quem chama é admin/super_admin
  if not exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role in ('admin','super_admin')
  ) then
    raise exception 'not allowed';
  end if;

  -- Remoções em ordem segura
  -- Materiais de módulo
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='module_materials') then
    delete from public.module_materials;
  end if;

  -- Aulas
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='lessons') then
    delete from public.lessons;
  end if;

  -- Provas
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='exams') then
    delete from public.exams;
  end if;

  -- Disciplinas
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='subjects') then
    delete from public.subjects;
  end if;

  -- Progresso do aluno
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='student_progress') then
    delete from public.student_progress;
  end if;

  -- Históricos e calendários acadêmicos
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='academic_transcripts') then
    delete from public.academic_transcripts;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='academic_calendar') then
    delete from public.academic_calendar;
  end if;

  -- Matrículas e pagamentos
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='student_enrollments') then
    delete from public.student_enrollments;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='payments') then
    delete from public.payments;
  end if;

  -- Módulos e Cursos
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='modules') then
    delete from public.modules;
  end if;
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='courses') then
    delete from public.courses;
  end if;

  -- Alunos (remover somente perfis com role student)
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='user_roles') then
    delete from public.profiles where id in (
      select user_id from public.user_roles where role='student'
    );
    delete from public.user_roles where role='student';
  end if;

  -- Observação: remoção de arquivos em Storage deve ser feita pelo painel de Storage.
end;
$$;

