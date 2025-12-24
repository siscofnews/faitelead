-- ========================================
-- SCRIPT MESTRE: CORRIGIR TODOS OS ERROS
-- ========================================
-- Este script corrige TODOS os problemas de carregamento de cursos
-- e permissões no sistema EAD FAITEL
-- ========================================

-- PASSO 1: REMOVER TODAS AS POLÍTICAS RLS ANTIGAS DA TABELA COURSES
-- ========================================

DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'courses' 
          AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.courses', pol.policyname);
        RAISE NOTICE 'Política removida: %', pol.policyname;
    END LOOP;
END $$;

-- PASSO 2: VERIFICAR ESTRUTURA DA TABELA COURSES
-- ========================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'courses'
ORDER BY ordinal_position;

-- PASSO 3: GARANTIR QUE RLS ESTÁ HABILITADO
-- ========================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- PASSO 4: CRIAR POLÍTICAS RLS PERMISSIVAS PARA TODOS
-- ========================================

-- Política SELECT: Permitir que TODOS os usuários autenticados vejam cursos
CREATE POLICY "Permitir SELECT para todos autenticados"
ON public.courses
FOR SELECT
TO authenticated
USING (true);

-- Política SELECT: Permitir que usuários anônimos vejam cursos ativos
CREATE POLICY "Permitir SELECT público para cursos ativos"
ON public.courses
FOR SELECT
TO anon
USING (is_active = true);

-- Política INSERT: Apenas admins podem criar cursos
CREATE POLICY "Admins podem criar cursos"
ON public.courses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Política UPDATE: Apenas admins podem atualizar cursos
CREATE POLICY "Admins podem atualizar cursos"
ON public.courses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Política DELETE: Apenas admins podem deletar cursos
CREATE POLICY "Admins podem deletar cursos"
ON public.courses
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- PASSO 5: GARANTIR PERMISSÕES PARA O USUÁRIO ADMIN
-- ========================================

-- Inserir role de super_admin para faiteloficial@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Inserir role de admin para faiteloficial@gmail.com (redundância)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- PASSO 6: CRIAR CURSO DE TESTE SE NÃO EXISTIR
-- ========================================

DO $$
BEGIN
    -- Verificar se já existe algum curso
    IF NOT EXISTS (SELECT 1 FROM public.courses LIMIT 1) THEN
        INSERT INTO public.courses (
            title,
            description,
            monthly_price,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            'Curso de Teste - Sistema EAD FAITEL',
            'Este curso foi criado automaticamente para testar o sistema. Você pode editá-lo ou excluí-lo.',
            99.00,
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Curso de teste criado com sucesso!';
    ELSE
        RAISE NOTICE 'Já existem cursos no sistema. Nenhum curso de teste foi criado.';
    END IF;
END $$;

-- PASSO 7: VERIFICAR POLÍTICAS CRIADAS
-- ========================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'courses' 
  AND schemaname = 'public'
ORDER BY policyname;

-- PASSO 8: VERIFICAR ROLES DO USUÁRIO ADMIN
-- ========================================

SELECT 
    ur.role,
    au.email,
    au.id as user_id
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com'
ORDER BY ur.role;

-- PASSO 9: VERIFICAR CURSOS NO BANCO
-- ========================================

SELECT 
    id,
    title,
    description,
    monthly_price,
    is_active,
    created_at
FROM public.courses 
ORDER BY created_at DESC
LIMIT 10;

-- PASSO 10: CONTAR TOTAL DE CURSOS
-- ========================================

SELECT 
    COUNT(*) as total_cursos,
    COUNT(*) FILTER (WHERE is_active = true) as cursos_ativos,
    COUNT(*) FILTER (WHERE is_active = false) as cursos_inativos
FROM public.courses;

-- ========================================
-- FIM DO SCRIPT MESTRE
-- ========================================
-- Se você ver os resultados dos SELECTs acima, o script funcionou!
-- Agora teste a aplicação em http://localhost:8080/
-- ========================================
