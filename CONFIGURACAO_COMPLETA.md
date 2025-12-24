# 🔧 Configuração Completa - Super Admin + Netlify

## ✅ INFORMAÇÕES DO SEU PROJETO:

### Supabase
**URL:** https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr
**Project ID:** bpqdwsvrggixgdmboftr

### Netlify
**Team:** siscofnews
**Dashboard:** https://app.netlify.com/teams/siscofnews/projects
**Site:** https://faitel-ead.netlify.app (se já deployed)

---

## 📍 PASSO 1: Configurar Super Admin no Supabase

### 1.1 - Criar Usuário (se ainda não criou)
1. Abrir: https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/auth/users
2. Click **"Add user"** → **"Create new user"**
3. Preencher:
   - Email: `faiteloficial@gmail.com`
   - Password: `P26192920m`
   - ✅ **Auto Confirm User** (MARCAR)
4. Click **"Create user"**

### 1.2 - Executar Script SQL
1. Abrir: https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/sql/new
2. Copiar TODO o conteúdo de: `supabase/configurar_super_admin_CORRIGIDO.sql`
3. Colar no SQL Editor
4. Click **"Run"** ▶️

**Resultado esperado:**
```
✓ Usuário encontrado
✓ Perfil criado/atualizado
✓ Role SUPER_ADMIN adicionada
✓ Role ADMIN adicionada
✅ SUPER ADMIN CONFIGURADO COM SUCESSO!
```

---

## 📍 PASSO 2: Configurar Variáveis de Ambiente no Netlify

### 2.1 - Obter Credenciais do Supabase
1. Abrir: https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/settings/api
2. Copiar:
   - **Project URL** (ex: https://bpqdwsvrggixgdmboftr.supabase.co)
   - **anon/public key** (longa string começando com eyJ...)

### 2.2 - Adicionar no Netlify
1. Abrir seu site no Netlify (team siscofnews)
2. Ir em: **Site settings** → **Environment variables**
3. Click **"Add a variable"**
4. Adicionar 2 variáveis:

```
Nome: VITE_SUPABASE_URL
Valor: https://bpqdwsvrggixgdmboftr.supabase.co

Nome: VITE_SUPABASE_ANON_KEY  
Valor: [sua chave anon/public do Supabase]
```

### 2.3 - Redeploy
1. Ir em **Deploys**
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Aguardar rebuild (1-2 min)

---

## 📍 PASSO 3: Testar Login

1. Acessar: **https://faitel-ead.netlify.app**
2. Fazer login:
   - Email: `faiteloficial@gmail.com`
   - Senha: `P26192920m`
3. Verificar acesso aos dashboards

---

## 🎯 LINKS RÁPIDOS:

### Supabase
- **Authentication:** https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/auth/users
- **SQL Editor:** https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/sql/new
- **API Settings:** https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/settings/api

### Netlify  
- **Sites:** https://app.netlify.com/teams/siscofnews/sites
- **Seu site (faitel-ead):** Encontre na lista de sites

---

## ✅ CHECKLIST COMPLETO:

- [ ] Criar usuário no Supabase Authentication
- [ ] Executar script SQL (configurar_super_admin_CORRIGIDO.sql)
- [ ] Copiar URL e Key do Supabase
- [ ] Adicionar variáveis no Netlify
- [ ] Fazer redeploy no Netlify
- [ ] Testar login no site

---

**EM QUAL ETAPA VOCÊ ESTÁ?** Me avise se precisar de ajuda! 😊
