# 🚀 DEPLOY AGORA - Guia Rápido

## ✅ PRONTO PARA DEPLOY
- ✓ Build completo: **35 arquivos** na pasta `dist`
- ✓ Backend configurado
- ✓ Tudo testado localmente

---

## 📍 PASSO 1: Deploy Frontend (5 minutos)

### Opção A: Netlify Drop (MAIS FÁCIL)

1. **Abrir:** https://app.netlify.com/drop

2. **Arrastar pasta `dist`:**
   - Localização: `d:\EAD FAITEL 2025\faitel-ead-hub-main\dist`
   - Arrastar TODA a pasta `dist` para a área de drop
   - Aguardar upload (1-2 min)

3. **Pronto!** 
   - Netlify vai gerar URL como: `https://random-name-12345.netlify.app`
   - Copiar essa URL

### Opção B: Netlify Dashboard

1. **Login:** https://app.netlify.com
2. **"Add new site"** → **"Deploy manually"**
3. Arrastar pasta `dist`
4. Aguardar deploy

---

## 📍 PASSO 2: Deploy Backend (10 minutos)

### Render.com (Grátis)

1. **Criar conta:** https://render.com
   - Login com GitHub

2. **New Web Service:**
   - Click em **"New +"** → **"Web Service"**
   
3. **Conectar código:**
   - **Opção 1 (GIT):** Conectar seu repositório
   - **Opção 2 (Manual):** 
     - Fazer zip da pasta `backend`
     - Upload manual

4. **Configurar Service:**
   ```
   Name: faitel-backend
   Region: Oregon (US West)
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Environment Variables** (IMPORTANTE):
   Click em "Advanced" → "Add Environment Variable"
   
   Adicionar 3 variáveis:
   ```
   VITE_SUPABASE_URL = sua_url_supabase
   VITE_SUPABASE_ANON_KEY = sua_chave_supabase
   PORT = 8090
   ```
   
   **Onde pegar as chaves Supabase:**
   - Dashboard Supabase → Settings → API
   - URL: Project URL
   - Key: anon/public key

6. **Create Web Service**
   - Aguardar 3-5 minutos
   - URL gerada: `https://faitel-backend.onrender.com`

7. **Testar:**
   - Abrir: `https://faitel-backend.onrender.com/health`
   - Deve mostrar: `{"status":"ok"}`

---

## 📍 PASSO 3: Conectar Frontend + Backend (3 minutos)

No Netlify:

1. **Site settings** → **Environment variables**

2. **Add a variable** (adicionar 3):
   ```
   VITE_SUPABASE_URL = mesma_url_do_render
   VITE_SUPABASE_ANON_KEY = mesma_chave_do_render
   VITE_BACKEND_URL = https://faitel-backend.onrender.com
   ```

3. **Deploys** → **Trigger deploy** → **Deploy site**
   - Isso reconstrói o site com as variáveis

---

## 📍 PASSO 4: Testar (2 minutos)

1. **Abrir site:** `https://seu-site.netlify.app`

2. **Fazer login:**
   - Email: `faiteloficial@gmail.com` (ou seu admin)
   - Senha: sua senha

3. **Verificar dashboards:**
   - Admin Dashboard: `/admin/dashboard`
   - Super Admin: `/admin/super-admin`
   - Estatísticas devem carregar!

4. **Console do navegador:**
   - F12 → Console
   - NÃO deve ter erros CORS ou 404

---

## 🎯 URLs Finais

Você terá:
- **Site:** `https://xxx.netlify.app`
- **Backend:** `https://faitel-backend.onrender.com`
- **Supabase:** `https://xxx.supabase.co` (já tem)

---

## ⚡ Atalhos Rápidos

### Deploy Rápido Frontend (30 segundos)
```
1. https://app.netlify.com/drop
2. Arrastar pasta: d:\EAD FAITEL 2025\faitel-ead-hub-main\dist
3. Copiar URL gerada
```

### Testar Backend Depois do Deploy
```bash
# No navegador:
https://faitel-backend.onrender.com/health
https://faitel-backend.onrender.com/stats/system
```

---

## 🆘 Problemas?

### Backend não carrega
- Esperar 30-60s (Render "acordando" do sleep)
- Verificar variáveis de ambiente
- Ver logs no Render dashboard

### Frontend não mostra dados
- Abrir F12 → Console
- Verificar erros
- Confirmar VITE_BACKEND_URL correto
- Fazer redeploy após adicionar variáveis

### CORS Error
- Backend já tem CORS habilitado
- Verificar URL do backend está correta
- Ver se backend está rodando (/health)

---

## 💡 Dica: Primeiros 30 segundos

**Render Free Tier:**
- Backend "hiberna" após inatividade
- Primeira requisição pode demorar ~30s
- Depois fica normal!

---

**COMEÇAR AGORA:**
1. https://app.netlify.com/drop ← FRONTEND
2. https://render.com ← BACKEND
3. Seguir passos acima

**ESTIMATIVA:** 15-20 minutos total
