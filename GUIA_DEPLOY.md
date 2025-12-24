# 🚀 Guia de Deploy - FAITEL EAD

## ⚠️ IMPORTANTE - Antes de Colocar no Ar

### 1. Configuração Atual (Desenvolvimento)

O sistema está rodando com:
- ✅ AUTH MOCK (autenticação local)
- ✅ Cursos MOCK (localStorage)
- ⚠️ Dados temporários (perdem ao limpar cache)

**ISSO É APENAS PARA DESENVOLVIMENTO!**

---

## 🔧 Para Produção - Você Precisa:

### 1️⃣ Configurar Supabase Auth Real

Atualmente você usa AUTH MOCK que não é seguro para produção.

**Opções:**

**A) Criar usuário real no Supabase:**
```sql
-- Execute no Supabase SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at
) VALUES (
  'faiteloficial@gmail.com',
  crypt('P26192920m', gen_salt('bf')),
  NOW()
);
```

**B) OU obter service_role key:**
1. Supabase Dashboard → Settings → API
2. Copiar `service_role` key
3. Adicionar ao `.env`:
```
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
```

### 2️⃣ Migrar Cursos para Banco Real

Os cursos mock precisam ir para o Supabase:

```sql
-- Criar cursos no banco
INSERT INTO public.courses (title, description, monthly_price, is_active)
VALUES 
  ('Teologia Básica', 'Curso introdutório', 99, true),
  ('Teologia Sistemática', 'Estudo aprofundado', 120, true),
  ('Bibliologia Avançada', 'Estudo das Escrituras', 110, true);
```

### 3️⃣ Build para Produção

```bash
# Testar build
npm run build

# Verificar pasta dist/
# Deve gerar arquivos otimizados
```

---

## 🌐 Opções de Deploy

### Opção 1: Vercel (Recomendado - Grátis)

1. **Criar conta:** https://vercel.com
2. **Instalar Vercel CLI:**
```bash
npm install -g vercel
```

3. **Deploy:**
```bash
vercel
```

4. **Configurar variáveis de ambiente:**
   - No dashboard Vercel → Settings → Environment Variables
   - Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Opção 2: Netlify (Grátis)

1. **Criar conta:** https://netlify.com
2. **Conectar repositório GitHub**
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`

### Opção 3: VPS Próprio

Requer servidor Linux com Node.js instalado.

```bash
# Copiar arquivos para servidor
scp -r dist/* user@seu-servidor:/var/www/faitel

# Configurar nginx
sudo nano /etc/nginx/sites-available/faitel
```

---

## ✅ Checklist PRÉ-DEPLOY

- [ ] Todas as funcionalidades testadas
- [ ] Console sem erros (F12)
- [ ] Build de produção funciona
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase configurado
- [ ] Usuário Super Admin criado no banco
- [ ] RLS policies configuradas
- [ ] Backup dos dados

---

## 🔐 Segurança para Produção

### CRÍTICO - Remover/Alterar:

1. **AUTH MOCK** (trocar por auth real)
2. **Senhas hardcoded** no código
3. **Dados mock** do localStorage
4. **Service role key** (se usar, só em backend)

### Adicionar:

1. **HTTPS** (SSL/TLS)
2. **Rate limiting**
3. **Validação de inputs**
4. **Logs de auditoria**

---

## 📊 Monitoramento

Após deploy, monitore:
- Erros no console (Sentry, LogRocket)
- Performance (Google Analytics)
- Uptime (UptimeRobot)
- Custos do Supabase

---

## 🆘 Suporte

Se algo der errado:
1. Verifique logs no console (F12)
2. Verifique logs do Supabase
3. Consulte documentação: https://supabase.com/docs
4. Reverta para versão anterior se necessário

---

## 📝 Notas Importantes

### Dados Atuais:
- **Email Super Admin:** faiteloficial@gmail.com
- **Senha:** P26192920m
- **Supabase URL:** https://bpqdwsvrggixgdmboftr.supabase.co
- **Ambiente:** Desenvolvimento (localhost)

### ANTES de ir para produção:
1. ✅ Testar TUDO localmente
2. ✅ Fazer backup do banco
3. ✅ Configurar domínio próprio
4. ✅ Configurar emails de notificação
5. ✅ Preparar suporte ao usuário

---

**BOM DEPLOY! 🚀**
