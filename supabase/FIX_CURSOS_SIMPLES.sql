-- ========================================
-- CORRIGIR ERROS DE CARREGAMENTO DE CURSOS
-- ========================================

-- 1. REMOVER POLÍTICAS ANTIGAS
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'courses' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.courses', pol.policyname);
    END LOOP;
END $$;

-- 2. HABILITAR RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS NOVAS
CREATE POLICY "SELECT_todos_autenticados"
ON public.courses FOR SELECT TO authenticated
USING (true);

CREATE POLICY "SELECT_publico_ativos"
ON public.courses FOR SELECT TO anon
USING (is_active = true);

CREATE POLICY "INSERT_admins"
ON public.courses FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "UPDATE_admins"
ON public.courses FOR UPDATE TO authenticated
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

CREATE POLICY "DELETE_admins"
ON public.courses FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- 4. GARANTIR PERMISSÕES ADMIN
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'faiteloficial@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. CRIAR CURSO DE TESTE
DO $$
BEGIN
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
            'Este curso foi criado automaticamente para testar o sistema.',
            99.00,
            true,
            NOW(),
            NOW()
        );
    END IF;
END $$;

-- 6. VERIFICAR RESULTADOS
SELECT 'POLÍTICAS CRIADAS:' as resultado;
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'courses' AND schemaname = 'public'
ORDER BY policyname;

SELECT 'ROLES DO ADMIN:' as resultado;
SELECT ur.role, au.email
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com';

SELECT 'CURSOS NO BANCO:' as resultado;
SELECT id, title, is_active, created_at
FROM public.courses 
ORDER BY created_at DESC
LIMIT 5;
