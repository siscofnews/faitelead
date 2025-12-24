# Debug - Curso Não Aparece

## Problema
- Usuário cria curso com sucesso
- Mensagem de "salvou" aparece
- MAS curso não aparece na lista

## Verificações Feitas
1. ✅ Permissões INSERT, UPDATE, DELETE criadas
2. ✅ Permissão SELECT atualizada
3. ✅ Banco limpo (TRUNCATE)
4. ❌ Curso ainda não aparece

## Próximos Passos
1. Verificar se curso FOI SALVO no banco (Table Editor)
2. Se SIM: problema é de EXIBIÇÃO (RLS policy SELECT)
3. Se NÃO: problema é de SALVAMENTO (RLS policy INSERT ou erro frontend)

## Status: Investigando banco de dados
