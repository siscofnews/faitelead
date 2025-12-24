# Scripts SQL para Gerenciamento de Cursos

Este diretório contém scripts SQL úteis para gerenciar cursos diretamente no banco de dados Supabase.

## ⚠️ SCRIPTS DE EXCLUSÃO FORÇADA (Recomendados)

Se os scripts normais não funcionarem devido a políticas RLS (Row Level Security), use estes:

### 🔥 `force_delete_all_courses.sql`
**Propósito:** FORÇAR a exclusão de TODOS os cursos, ignorando políticas RLS

**Como funciona:**
- Desabilita temporariamente o RLS em todas as tabelas
- Deleta todos os dados relacionados
- Reabilita o RLS após a exclusão
- Mostra estatísticas detalhadas

**Como usar:**
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Cole TODO o conteúdo do arquivo `force_delete_all_courses.sql`
4. Clique em **Run**
5. Aguarde a confirmação de exclusão

### 🔥 `force_delete_single_course.sql`
**Propósito:** FORÇAR a exclusão de um curso específico, ignorando políticas RLS

**Como usar:**
1. Execute `list_all_courses.sql` para ver os IDs
2. Copie o ID do curso que deseja deletar
3. Abra `force_delete_single_course.sql`
4. Substitua `'COURSE_ID_AQUI'` pelo ID do curso
5. Cole no SQL Editor do Supabase
6. Clique em **Run**

---

## 📋 Scripts Disponíveis (Normais)

### 1. `list_all_courses.sql`
**Propósito:** Listar todos os cursos com informações detalhadas

**Como usar:**
1. Acesse o painel do Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `list_all_courses.sql`
4. Clique em **Run**

**Retorna:**
- ID do curso
- Título
- Descrição
- Modalidade
- Duração (meses)
- Carga horária
- Mensalidade
- Status (ativo/inativo)
- Data de criação
- Total de módulos
- Total de alunos matriculados

---

### 2. `delete_single_course.sql`
**Propósito:** Deletar um curso específico e todos os dados relacionados

**⚠️ ATENÇÃO:** Esta ação não pode ser desfeita!

**Como usar:**
1. Primeiro, execute `list_all_courses.sql` para ver os IDs dos cursos
2. Copie o ID do curso que deseja deletar
3. Abra o arquivo `delete_single_course.sql`
4. Substitua `'COURSE_ID_AQUI'` pelo ID do curso (mantenha as aspas simples)
   - Exemplo: `target_course_id UUID := '123e4567-e89b-12d3-a456-426614174000';`
5. Cole o script no SQL Editor do Supabase
6. Clique em **Run**

**O que será deletado:**
- Materiais dos módulos
- Aulas
- Provas
- Disciplinas
- Progresso dos alunos
- Históricos acadêmicos
- Calendário acadêmico
- Matrículas
- Pagamentos relacionados
- Módulos
- O curso em si

---

### 3. `delete_all_courses.sql`
**Propósito:** Deletar TODOS os cursos e dados relacionados

**⚠️ ATENÇÃO MÁXIMA:** Esta ação irá deletar TODOS os cursos do sistema e não pode ser desfeita!

**Como usar:**
1. **CERTIFIQUE-SE** de que realmente deseja deletar todos os cursos
2. Faça um backup do banco de dados antes (recomendado)
3. Acesse o painel do Supabase
4. Vá em **SQL Editor**
5. Cole o conteúdo do arquivo `delete_all_courses.sql`
6. Clique em **Run**

**O que será deletado:**
- TODOS os cursos
- TODOS os módulos
- TODAS as aulas
- TODOS os materiais
- TODAS as matrículas
- TODOS os dados relacionados

---

## 🔐 Permissões Necessárias

Para executar estes scripts, você precisa:
- Acesso ao painel do Supabase
- Permissões de administrador no projeto
- Acesso ao SQL Editor

---

## 🎯 Alternativa: Interface Web

Se você preferir usar a interface web do sistema:

1. Faça login como **Super Administrador** ou **Administrador**
2. Acesse **Admin** → **Gestão de Cursos**
3. Use as opções do menu de cada curso:
   - **Editar**: Modificar informações do curso
   - **Excluir**: Deletar um curso específico
4. Ou use os botões no topo da página:
   - **Excluir Todos os Cursos**: Remove todos os cursos
   - **Zerar Sistema**: Remove tudo (cursos, alunos, etc.)

---

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup antes de executar operações de exclusão
2. **Transações**: Os scripts usam transações (BEGIN/COMMIT) para garantir consistência
3. **Ordem**: A ordem de exclusão é importante para respeitar as chaves estrangeiras
4. **Logs**: Os scripts fornecem mensagens de progresso durante a execução
5. **Verificação**: Após a execução, os scripts mostram o resultado final

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique as mensagens de erro no SQL Editor
2. Confirme que tem as permissões necessárias
3. Verifique se o ID do curso está correto (no caso do delete_single_course.sql)
4. Consulte os logs de auditoria para ver o histórico de alterações
