# FAITEL Backend - Guia de Deploy

## Deploy no Render.com (Recomendado - Grátis)

### 1. Criar Conta
- Acesse: https://render.com
- Faça login com GitHub

### 2. Criar Novo Web Service
1. Click em **"New +"** → **"Web Service"**
2. Conectar repositório (ou fazer upload manual da pasta `backend`)
3. Configurações:
   - **Name:** `faitel-backend-api`
   - **Region:** Oregon (US West)
   - **Branch:** main (ou sua branch)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

### 3. Variáveis de Ambiente
Adicionar em **Environment**:
```
VITE_SUPABASE_URL=sua_url_supabase_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_supabase_aqui
PORT=8090
NODE_ENV=production
```

### 4. Deploy
- Click em **"Create Web Service"**
- Aguardar deploy (3-5 minutos)
- URL gerada será algo como: `https://faitel-backend-api.onrender.com`

### 5. Testar
```bash
curl https://faitel-backend-api.onrender.com/health
curl https://faitel-backend-api.onrender.com/stats/system
```

---

## Deploy no Railway.app (Alternativa)

### 1. Criar Projeto
- Acesse: https://railway.app
- Login com GitHub
- **New Project** → **Deploy from GitHub repo**

### 2. Configurações
- Selecionar repositório
- **Root Directory:** `/backend`
- Railway detecta automaticamente Node.js

### 3. Variáveis de Ambiente
Mesmo do Render acima.

### 4. Deploy
Deploy automático após configuração.

---

## Deploy no Fly.io (Avançado)

```bash
# Instalar Fly CLI
# Windows: irm https://fly.io/install.ps1 | iex

cd backend

# Login
fly auth login

# Launch app
fly launch

# Configurar environment
fly secrets set VITE_SUPABASE_URL="sua_url"
fly secrets set VITE_SUPABASE_ANON_KEY="sua_chave"

# Deploy
fly deploy
```

---

## Após Deploy do Backend

### Atualizar URL no Frontend

**No Netlify**, adicionar variável de ambiente:
```
VITE_BACKEND_URL=https://sua-url-backend.onrender.com
```

Ou atualizar localmente em `.env`:
```env
VITE_BACKEND_URL=https://faitel-backend-api.onrender.com
```

### Rebuild Frontend
```bash
npm run build
```

---

## Verificação

✅ Backend health check: `https://sua-url/health`  
✅ Estatísticas sistema: `https://sua-url/stats/system`  
✅ Admin dashboard: `https://sua-url/stats/admin-dashboard`

---

## Troubleshooting

### Backend não inicia
- Verificar logs no painel do Render/Railway
- Confirmar variáveis de ambiente configuradas
- Checar se `PORT` está definido

### CORS Error
- Backend já tem CORS habilitado
- Verificar se URL do frontend está correta

### Dados não carregam
- Verificar se Supabase URL e Key estão corretos
- Testar endpoints manualmente com curl
- Checar logs de erro no console do navegador
