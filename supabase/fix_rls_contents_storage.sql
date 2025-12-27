-- =====================================================
-- FIX: CORREÇÃO DE PERMISSÕES PARA UPLOAD DE AULAS
-- =====================================================
-- Este script corrige o erro: "new row violates row-level security policy"
-- Ele libera permissões para a tabela de conteúdos e para o storage
-- =====================================================

DO $$
BEGIN

  -- 1. CORREÇÃO DA TABELA CONTENTS (Se existir)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contents') THEN
    RAISE NOTICE '🔧 Corrigindo tabela contents...';
    
    ALTER TABLE IF EXISTS public.contents ENABLE ROW LEVEL SECURITY;

    -- Remover políticas antigas para evitar duplicidade
    DROP POLICY IF EXISTS "Admins can manage contents" ON public.contents;
    DROP POLICY IF EXISTS "Anyone can view contents" ON public.contents;

    -- Política: Admins podem fazer TUDO (Insert, Update, Delete, Select)
    CREATE POLICY "Admins can manage contents"
      ON public.contents FOR ALL
      USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
      );

    -- Política: Todos podem ver (leitura)
    CREATE POLICY "Anyone can view contents"
      ON public.contents FOR SELECT
      USING (true);
      
    RAISE NOTICE '✅ Tabela contents corrigida!';
  END IF;

  -- 2. CORREÇÃO DA TABELA MODULE_CONTENTS (Fallback se usar o schema antigo/novo)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'module_contents') THEN
    RAISE NOTICE '🔧 Corrigindo tabela module_contents...';
    
    ALTER TABLE IF EXISTS public.module_contents ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Admins can manage module_contents" ON public.module_contents;
    DROP POLICY IF EXISTS "Anyone can view active contents" ON public.module_contents;

    CREATE POLICY "Admins can manage module_contents"
      ON public.module_contents FOR ALL
      USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
      );

    CREATE POLICY "Anyone can view active contents"
      ON public.module_contents FOR SELECT
      USING (is_active = true);
      
    RAISE NOTICE '✅ Tabela module_contents corrigida!';
  END IF;

  -- 3. CORREÇÃO DO STORAGE (BUCKET course-materials)
  
  -- Criar bucket se não existir
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('course-materials', 'course-materials', true)
  ON CONFLICT (id) DO NOTHING;

  -- Remover políticas antigas do storage
  DROP POLICY IF EXISTS "Give admin access to course-materials" ON storage.objects;
  DROP POLICY IF EXISTS "Public View" ON storage.objects;

  -- Política: Admins podem fazer TUDO no bucket course-materials
  CREATE POLICY "Give admin access to course-materials"
    ON storage.objects FOR ALL
    USING (
      bucket_id = 'course-materials' 
      AND (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
      )
    );

  -- Política: Todos podem visualizar arquivos (Public View)
  CREATE POLICY "Public View"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'course-materials');

  RAISE NOTICE '✅ Storage course-materials corrigido!';
  
END $$;
