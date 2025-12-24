# 🔐 Como Configurar Super Admin no Supabase

## Método Rápido (Recomendado)

### Passo 1: Criar Usuário no Supabase Auth

1. **Acessar Supabase Dashboard:**
   - https://app.supabase.com/project/SEU_PROJECT_ID/auth/users

2. **Add User:**
   - Click em **"Add user"** → **"Create new user"**
   - **Email:** `faiteloficial@gmail.com`
   - **Password:** `P26192920m`
   - **Auto Confirm User:** ✅ SIM (marcar checkbox)
   - Click em **"Create user"**

3. **Copiar UUID:**
   - Após criar, copiar o UUID do usuário (ex: `abc123...`)

---

### Passo 2: Executar Script SQL

1. **SQL Editor:**
   - No Supabase: **SQL Editor** → **New query**

2. **Colar e Executar:**
   - Abrir arquivo: `supabase/configurar_super_admin.sql`
   - Copiar todo o conteúdo
   - Colar no SQL Editor
   - Click em **"Run"** ▶️

3. **Verificar Output:**
   - Deve mostrar:
     ```
     ✓ Perfil criado/atualizado como SUPER_ADMIN
     ✓ Role SUPER_ADMIN adicionada
     ✓ Registrado como Master Super Admin
     ✓ Log de auditoria criado
     SUPER ADMIN CONFIGURADO COM SUCESSO!
     ```

---

### Passo 3: Testar Login

1. **Acessar site:**
   - https://faitel-ead.netlify.app
   - Ou: http://localhost:8080 (local)

2. **Fazer Login:**
   - Email: `faiteloficial@gmail.com`
   - Senha: `P26192920m`

3. **Verificar Permissões:**
   - Deve ter acesso total a:
     - ✅ Admin Dashboard
     - ✅ Super Admin Dashboard
     - ✅ Todas as configurações
     - ✅ Gestão de usuários, cursos, polos, etc.

---

## Alternativa: Script Direto (Se usuário já existir)

Se o usuário **já foi criado** no Supabase Auth:

```sql
-- Execute no SQL Editor do Supabase

-- 1. Obter UUID do usuário
SELECT id, email FROM auth.users WHERE email = 'faiteloficial@gmail.com';

-- 2. Substituir USER_ID_AQUI pelo UUID retornado acima
DO $$
DECLARE
  v_user_id uuid := 'USER_ID_AQUI'; -- ← SUBSTITUIR
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, nome, role, ativo)
  VALUES (v_user_id, 'Super Admin FAITEL', 'SUPER_ADMIN', true)
  ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', ativo = true;

  -- Adicionar role
  INSERT INTO public.user_roles (user_id, role, active)
  VALUES (v_user_id, 'SUPER_ADMIN', true)
  ON CONFLICT DO NOTHING;

  -- Master super admin
  INSERT INTO public.master_super_admin (user_id, active)
  VALUES (v_user_id, true)
  ON CONFLICT (user_id) DO UPDATE SET active = true;

  RAISE NOTICE 'Super Admin configurado!';
END $$;
```

---

## Verificar Configuração

Execute para confirmar:

```sql
-- Ver perfil
SELECT p.*, au.email
FROM public.profiles p
JOIN auth.users au ON au.id = p.id
WHERE au.email = 'faiteloficial@gmail.com';

-- Ver roles
SELECT ur.*, au.email
FROM public.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
WHERE au.email = 'faiteloficial@gmail.com';

-- Ver master super admin
SELECT msa.*, au.email
FROM public.master_super_admin msa
JOIN auth.users au ON au.id = msa.user_id
WHERE au.email = 'faiteloficial@gmail.com';
```

---

## Troubleshooting

### "Usuário não encontrado"
- Criar primeiro no Authentication do Supabase
- Verificar email correto

### "Permissão negada"
- Verificar RLS policies
- Confirmar role = 'SUPER_ADMIN' no profiles

### Login não funciona
- Confirmar senha: `P26192920m`
- Verificar "Auto Confirm User" está marcado
- Checar variáveis de ambiente no site

---

## Permissões do Super Admin

Com SUPER_ADMIN você terá:

✅ **Acesso Total:**
- Criar/editar/deletar polos
- Criar/editar/deletar núcleos  
- Criar/editar/deletar cursos
- Gerenciar todos os usuários
- Ver todas as estatísticas
- Acessar logs de auditoria
- Configurar sistema completo

✅ **Proteção:**
- Não pode ser deletado (soft delete apenas)
- Registrado em `master_super_admin`
- Todas ações logadas em `audit_logs`

---

## Scripts Disponíveis

- `configurar_super_admin.sql` - Script principal
- `comando_mestre_ead.sql` - Schema completo do banco
- `fix_permissions_and_reset.sql` - Resetar permissões (se necessário)

---

**Pronto!** Após executar, você terá **acesso total** como Super Admin Global! 🎉
