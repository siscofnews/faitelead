# Matrículas – Fluxo Rápido

## Fluxo
1. Cadastro do aluno (portal) e atribuição do papel `student`.
2. Criar matrícula no curso \"Graduação em Teologia\" (`student_enrollments` com `student_id` e `course_id`).
3. Acesso imediato à disciplina Bibliologia (trilha de módulos/aulas).

## Importação em lote
- CSV com: `full_name,email,student_id,course_id`.
- Script/admin: inserir registros em `student_enrollments`.

## Verificação
- Aluno acessa `Portal do Aluno → Meus Cursos` e vê Bibliologia com progresso inicial.

## Observações
- Progresso é gravado em `lesson_progress`.
- Simulados e prova final liberam conforme regra de conclusão.
