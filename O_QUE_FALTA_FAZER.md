# ✅ SITE JÁ ESTÁ NO AR!

## 🌐 URL do seu site:
https://faitel-ead.netlify.app

---

## ⚠️ O QUE FALTA FAZER (2 coisas simples):

### 1️⃣ CONFIGURAR NETLIFY (Variáveis de Ambiente)

**Para o site funcionar, precisa das credenciais do Supabase:**

1. **Abra:** https://app.netlify.com/teams/siscofnews/sites
2. **Procure e clique** no site **"faitel-ead"** (na lista)
3. **Entre em:** Site settings → Environment variables
4. **Clique:** Add a variable (botão verde)
5. **Adicione 2 variáveis:**

```
Variável 1:
Name: VITE_SUPABASE_URL
Value: https://bpqdwsvrggixgdmboftr.supabase.co

Variável 2:
Name: VITE_SUPABASE_ANON_KEY
Value: (sua chave - veja onde pegar abaixo)
```

**Onde pegar a chave:**
- Abrir: https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/settings/api
- Copiar a chave em **"anon / public"** (começa com eyJ...)
- Colar no Value da variável 2

6. **Depois de adicionar as 2 variáveis:**
   - Ir em: Deploys
   - Clicar: Trigger deploy → Deploy site
   - Aguardar 1-2 minutos

---

### 2️⃣ CRIAR SEU USUÁRIO SUPER ADMIN

**Apenas 3 clicks:**

1. **Abra:** https://supabase.com/dashboard/project/bpqdwsvrggixgdmboftr/auth/users

2. **Clique:** Add user → Create new user

3. **Preencha:**
   ```
   Email: faiteloficial@gmail.com
   Password: P26192920m
   ✅ MARCAR: Auto Confirm User
   ```

4. **Clique:** Create user

**PRONTO!** Agora você pode fazer login como admin!

---

## 🎉 TESTAR:

1. Abra: https://faitel-ead.netlify.app
2. Faça login:
   - Email: faiteloficial@gmail.com
   - Senha: P26192920m
3. Você terá acesso de ADMIN!

---

## 📋 RESUMO:

✅ Site deployado: https://faitel-ead.netlify.app  
⏳ FALTA: Configurar variáveis no Netlify (passo 1)  
⏳ FALTA: Criar usuário Super Admin (passo 2)  
⏳ DEPOIS: Testar login

---

**COMECE PELO PASSO 1!** Me avise quando terminar cada passo! 😊
