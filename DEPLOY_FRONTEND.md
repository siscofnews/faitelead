# Deploy Frontend - Netlify

## Método 1: Netlify CLI (Recomendado)

### 1. Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 2. Login
```bash
netlify login
```

### 3. Deploy
```bash
# Deploy de preview
netlify deploy --dir=dist

# Deploy de produção
netlify deploy --prod --dir=dist
```

---

## Método 2: Netlify UI

### 1. Acessar Netlify
- URL: https://app.netlify.com
- Login com sua conta

### 2. Novo Site
1. Click em **"Add new site"** → **"Deploy manually"**
2. Arraste a pasta `dist` para o upload
3. Ou conecte o repositório GitHub

### 3. Configurar Variáveis de Ambiente

Em **Site settings** → **Environment variables**, adicionar:

```env
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_key_aqui
VITE_BACKEND_URL=https://sua-url-backend.onrender.com
```

> **Importante:** Após adicionar variáveis, fazer **Redeploy** do site!

### 4. Configurações de Build (se conectar Git)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Base directory:** (deixar vazio)

---

## Método 3: Git Auto-Deploy

### 1. Conectar Repositório
- **Add new site** → **Import an existing project**
- Conectar GitHub/GitLab/Bitbucket
- Selecionar repositório

### 2. Deploy Settings
Netlify detecta automaticamente `netlify.toml` com:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Variáveis de Ambiente
Adicionar as mesmas variáveis acima.

### 4. Deploy Automático
- Cada push na branch principal = deploy automático
- Preview deploys para PRs

---

## Após Deploy

### 1. Domínio Customizado (Opcional)
- **Domain settings** → **Add custom domain**
- Configurar DNS conforme instruções

### 2. HTTPS
- Automático via Let's Encrypt
- Ativado por padrão

### 3. Testar Site
1. Acessar URL do Netlify (ex: `https://faitel-ead.netlify.app`)
2. Testar login
3. Verificar dashboards
4. Checar se estatísticas carregam

---

## Verificação Rápida

✅ Site carrega: `https://seu-site.netlify.app`  
✅ Login funciona  
✅ Dashboards exibem dados  
✅ Console sem erros CORS  
✅ Estatísticas carregando do backend

---

## Troubleshooting

### "Page not found" em rotas
- Verificar se `netlify.toml` tem redirects configurados
- Ou adicionar arquivo `_redirects` na pasta `public`:
  ```
  /*    /index.html   200
  ```

### Variáveis de ambiente não funcionam
- Garantir que começam com `VITE_`
- Fazer **Redeploy** após adicionar variáveis
- Checar no console do browser se valores estão undefined

### Build falha
- Verificar logs de build no Netlify
- Testar build localmente: `npm run build`
- Checar se todas as dependências estão em `package.json`

### Backend não conecta
- Verificar CORS no backend (já está habilitado)
- Confirmar `VITE_BACKEND_URL` correto
- Testar URL do backend manualmente
