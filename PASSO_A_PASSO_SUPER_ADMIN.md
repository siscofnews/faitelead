# 🎯 GUIA SUPER SIMPLES - Configurar Super Admin

## ✅ PASSO 1: Abrir Supabase

1. **Clique neste link:** https://app.supabase.com
2. **Faça login** com sua conta
3. **Selecione seu projeto** FAITEL

---

## ✅ PASSO 2: Criar Usuário

### 2.1 - Ir para Authentication
1. No menu lateral esquerdo, clique em **"Authentication"** (ícone de cadeado 🔐)
2. Clique em **"Users"**

### 2.2 - Adicionar Novo Usuário
1. Clique no botão verde **"Add user"** (canto superior direito)
2. Selecione **"Create new user"**

### 2.3 - Preencher Dados
Preencha EXATAMENTE assim:

```
Email address: faiteloficial@gmail.com
Password: P26192920m
```

**IMPORTANTE:** 
- ✅ **MARCAR** a checkbox: "Auto Confirm User"
- Esta checkbox é ESSENCIAL!

### 2.4 - Criar
1. Clique em **"Create user"**
2. **COPIAR o UUID** do usuário que aparece
   - Vai ser algo como: `a1b2c3d4-1234-5678-9abc-def012345678`
   - Copie e guarde este número!

---

## ✅ PASSO 3: Executar Script SQL

### 3.1 - Abrir SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone </> )
2. Clique em **"New query"**

### 3.2 - Colar o Script
1. Abra o arquivo: `supabase/configurar_super_admin.sql`
2. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. **Cole no SQL Editor** (Ctrl+V)

### 3.3 - Executar
1. Clique no botão **"Run"** ▶️ (canto inferior direito)
2. Aguarde processar (1-2 segundos)

### 3.4 - Ver Resultado
Você deve ver mensagens verdes tipo:
```
✓ Usuário encontrado: ...
✓ Perfil criado/atualizado
✓ Role SUPER_ADMIN adicionada
✓ Role ADMIN adicionada (acesso total)
✅ SUPER ADMIN CONFIGURADO COM SUCESSO!
Roles: super_admin + admin
```


---

## ✅ PASSO 4: Testar Login

### 4.1 - Abrir o Site
- **Online:** https://faitel-ead.netlify.app
- **Ou Local:** http://localhost:8080

### 4.2 - Fazer Login
```
Email: faiteloficial@gmail.com
Senha: P26192920m
```

### 4.3 - Verificar Acesso
Você deve ter acesso a:
- ✅ Admin Dashboard
- ✅ Super Admin Dashboard  
- ✅ Todas as configurações
- ✅ Gestão completa do sistema

---

## 🆘 Se Algo Der Errado

### "Usuário não encontrado" no script SQL:
- Volte no PASSO 2 e crie o usuário primeiro
- Verifique se o email está correto

### "Auto Confirm User" não aparece:
- Procure por "Email confirmation" ou similar
- Ou desmarque "Send confirmation email"

### Login não funciona:
- Verifique se marcou "Auto Confirm User"
- Espere 1 minuto e tente novamente
- Confirme a senha: `P26192920m`

### Script SQL dá erro:
- Verifique se o projeto Supabase está correto
- Confirme que criou o usuário primeiro no Authentication

---

## 📞 Precisa de Ajuda?

**Me avise em qual PASSO você está e o que aparece na tela!**

Posso te ajudar com:
- Capturas de tela
- Orientação mais detalhada
- Resolver erros específicos

---

**RESUMO RÁPIDO:**
1. Supabase → Authentication → Add User
2. Email: faiteloficial@gmail.com, Senha: P26192920m, ✅ Auto Confirm
3. SQL Editor → New Query → Colar script → Run ▶️
4. Testar login no site

**Pronto!** 🎉
