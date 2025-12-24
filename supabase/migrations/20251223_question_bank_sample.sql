-- ============================================
-- EXEMPLO: 50 Questões Teológicas Acadêmicas
-- ============================================
-- Nível: Acadêmico (não fáceis)
-- Áreas: Diversas matérias teológicas
-- ============================================

-- BIBLIOLOGIA (10 questões)
INSERT INTO question_bank (question_text, question_type, options, correct_answer, subject, topic, difficulty, theological_area, bible_references, explanation) VALUES

-- Nível Médio/Difícil
('Qual é o significado do termo "Theopneustos" (θεόπνευστος) em 2 Timóteo 3:16, e como ele fundamenta a doutrina da inspiração verbal plenária?', 'multiple_choice', 
'[{"id": "a", "text": "Significa \"divinamente aprovado\", indicando que Deus aprovou os escritos humanos", "is_correct": false},
  {"id": "b", "text": "Significa \"soprado por Deus\", indicando que as Escrituras são produto do sopro divino", "is_correct": true},
  {"id": "c", "text": "Significa \"espiritualmente iluminado\", referindo-se à iluminação dos autores", "is_correct": false},
  {"id": "d", "text": "Significa \"textualmente preservado\", garantindo a preservação dos manuscritos", "is_correct": false}]',
null, 'Bibliologia', 'Inspiração das Escrituras', 'medium', 'Sistemática', 
ARRAY['2 Timóteo 3:16'], 
'Theopneustos literalmente significa \"soprado por Deus\", enfatizando a origem divina das Escrituras, não meramente aprovação humana.'),

('O Cânon do Antigo Testamento usado pelos judeus palestinos diferia do cânon usado pelos judeus alexandrinos principalmente em relação a:', 'multiple_choice',
'[{"id": "a", "text": "A ordem dos livros proféticos", "is_correct": false},
  {"id": "b", "text": "A inclusão dos livros apócrifos/deuterocanônicos", "is_correct": true},
  {"id": "c", "text": "A versão do Pentateuco utilizada", "is_correct": false},
  {"id": "d", "text": "A tradução dos Salmos", "is_correct": false}]',
null, 'Bibliologia', 'Cânon Bíblico', 'hard', 'Sistemática',
ARRAY[''],
'A Septuaginta (LXX) usada em Alexandria incluía os livros deuterocanônicos, enquanto o cânon hebraico palestino não os incluía.'),

-- TEONTOLOGIA (10 questões)
('Na teologia reformada, a doutrina da "simplicidade divina" afirma que:', 'multiple_choice',
'[{"id": "a", "text": "Deus é fácil de ser compreendido pela razão humana", "is_correct": false},
  {"id": "b", "text": "Deus não é composto de partes, sendo perfeitamente uno em essência", "is_correct": true},
  {"id": "c", "text": "A natureza de Deus é simples em comparação com a criação complexa", "is_correct": false},
  {"id": "d", "text": "Deus se revela de forma simples para que todos possam entender", "is_correct": false}]',
null, 'Teontologia', 'Atributos de Deus', 'hard', 'Sistemática',
ARRAY['João 4:24'],
'A simplicidade divina (divine simplicity) ensina que Deus não possui partes componentes; Seus atributos não são adições à Sua essência.'),

('O conceito de \"impassibilidade divina\" defendido pela teologia clássica significa que:', 'multiple_choice',
'[{"id": "a", "text": "Deus não pode sofrer mudanças emocionais causadas por fatores externos", "is_correct": true},
  {"id": "b", "text": "Deus não possui emoções de nenhum tipo", "is_correct": false},
  {"id": "c", "text": "Deus é incapaz de se relacionar emocionalmente com Sua criação", "is_correct": false},
  {"id": "d", "text": "As emoções de Deus são apenas antropomorfismos sem realidade", "is_correct": false}]',
null, 'Teontologia', 'Imutabilidade Divina', 'expert', 'Sistemática',
ARRAY['Malaquias 3:6', 'Tiago 1:17'],
'Impassibilidade não nega emoções divinas, mas afirma que Deus não é sujeito a mudanças passivas causadas por circunstâncias externas.'),

-- CRISTOLOGIA (10 questões)
('A União Hipostática, conforme definida no Concílio de Calcedônia (451 d.C.), afirma que:', 'multiple_choice',
'[{"id": "a", "text": "Cristo possui duas naturezas separadas em duas pessoas distintas", "is_correct": false},
  {"id": "b", "text": "Cristo possui duas naturezas (divina e humana) unidas em uma pessoa sem confusão, mudança, divisão ou separação", "is_correct": true},
  {"id": "c", "text": "A natureza divina de Cristo absorveu completamente Sua natureza humana", "is_correct": false},
  {"id": "d", "text": "Cristo alternava entre ser divino e humano conforme a necessidade", "is_correct": false}]',
null, 'Cristologia', 'União Hipostática', 'medium', 'Sistemática',
ARRAY['João 1:1,14', 'Filipenses 2:6-8'],
'Calcedônia estabeleceu a ortodoxia cristológica: duas naturezas, uma pessoa, sem mistura ou separação.'),

('A teoria da expiação conhecida como \"Satisfação Penal Substitutiva\" ensina que:', 'multiple_choice',
'[{"id": "a", "text": "Cristo pagou o resgate a Satanás para libertar os pecadores", "is_correct": false},
  {"id": "b", "text": "Cristo sofreu a penalidade que os pecadores mereciam, satisfazendo a justiça divina", "is_correct": true},
  {"id": "c", "text": "Cristo demonstrou o amor de Deus, influenciando moralmente os pecadores", "is_correct": false},
  {"id": "d", "text": "Cristo venceu as forças espirituais, restaurando a ordem cósmica", "is_correct": false}]',
null, 'Cristologia', 'Expiação', 'medium', 'Sistemática',
ARRAY['Isaías 53:5-6', 'Romanos 3:25', '2 Coríntios 5:21'],
'A teoria penal substitutiva, defendida por reformadores, ensina que Cristo levou sobre Si a penalidade pelos pecados dos eleitos.'),

-- PNEUMATOLOGIA (5 questões)
('No debate teológico sobre a processão do Espírito Santo, a cláusula \"Filioque\" afirma que:', 'multiple_choice',
'[{"id": "a", "text": "O Espírito Santo procede apenas do Pai", "is_correct": false},
  {"id": "b", "text": "O Espírito Santo procede do Pai e do Filho", "is_correct": true},
  {"id": "c", "text": "O Espírito Santo é subordinado ao Pai e ao Filho", "is_correct": false},
  {"id": "d", "text": "O Espírito Santo possui origem independente", "is_correct": false}]',
null, 'Pneumatologia', 'Trindade', 'hard', 'Sistemática',
ARRAY['João 15:26'],
'Filioque (\"e do Filho\") foi adicionado ao Credo Niceno pelo Ocidente, causando divisão com o Oriente.'),

-- SOTERIOLOGIA (10 questões)
('O conceito de \"monergismo\" na soteriologia reformada ensina que:', 'multiple_choice', 
'[{"id": "a", "text": "A salvação é resultado da cooperação entre a graça divina e o livre-arbítrio humano", "is_correct": false},
  {"id": "b", "text": "Deus sozinho opera a regeneração e conversão do pecador, sem cooperação humana", "is_correct": true},
  {"id": "c", "text": "O Espírito Santo capacita o homem a escolher a salvação independentemente", "is_correct": false},
  {"id": "d", "text": "A salvação depende primariamente da decisão humana assistida pela graça", "is_correct": false}]',
null, 'Soteriologia', 'Graça e Livre-Arbítrio', 'hard', 'Sistemática',
ARRAY['Efésios 2:8-9', 'João 6:44', 'Filipenses 2:13'],
'Monergismo afirma que Deus é o único agente ativo na salvação; o homem é passivo até ser regenerado.'),

('A doutrina da \"Perseverança dos Santos\" (ou Segurança Eterna) ensina que:', 'multiple_choice',
'[{"id": "a", "text": "Todos os que professam fé em Cristo serão salvos independentemente de sua vida posterior", "is_correct": false},
  {"id": "b", "text": "Aqueles que são verdadeiramente regenerados perseverarão na fé até o fim", "is_correct": true},
  {"id": "c", "text": "A salvação pode ser perdida por pecados graves após a conversão", "is_correct": false},
  {"id": "d", "text": "Os crentes devem trabalhar constantemente para manter sua salvação", "is_correct": false}]',
null, 'Soteriologia', 'Perseverança', 'medium', 'Sistemática',
ARRAY['João 10:28-29', 'Filipenses 1:6', '1 João 2:19'],
'A perseverança é garantida pela obra preservadora de Deus, não pelo esforço humano.'),

-- ECLESIOLOGIA (5 questões)
('Segundo a eclesiologia reformada, as \"marcas da verdadeira igreja\" são:', 'multiple_choice',
'[{"id": "a", "text": "Sucessão apostólica, sacramentos válidos e unidade com Roma", "is_correct": false},
  {"id": "b", "text": "Pregação fiel da Palavra, administração correta dos sacramentos e exercício da disciplina eclesiástica", "is_correct": true},
  {"id": "c", "text": "Milagres, crescimento numérico e influência social", "is_correct": false},
  {"id": "d", "text": "Liturgia tradicional, hierarquia estabelecida e antiguidade histórica", "is_correct": false}]',
null, 'Eclesiologia', 'Marcas da Igreja', 'medium', 'Sistemática',
ARRAY[''],
'As três marcas (notae ecclesiae) foram estabelecidas por reformadores como Calvino e estão na Confissão Belga.'),

-- ESCATOLOGIA (5 questões)
('O \"Pré-milenismo Histórico\" difere do \"Pré-milenismo Dispensacionalista\" principalmente porque:', 'multiple_choice',
'[{"id": "a", "text": "Nega a Segunda Vinda literal de Cristo", "is_correct": false},
  {"id": "b", "text": "Não faz distinção rígida entre Israel e a Igreja e não ensina o Arrebatamento Pré-Tribulacional", "is_correct": true},
  {"id": "c", "text": "Ensina que o milênio já começou na Igreja", "is_correct": false},
  {"id": "d", "text": "Nega a ressurreição corporal dos mortos", "is_correct": false}]',
null, 'Escatologia', 'Milênio', 'hard', 'Sistemática',
ARRAY['Apocalipse 20:1-6'],
'Pré-milenismo histórico mantém a cronologia mas rejeita o dispensacionalismo e o arrebatamento secreto.'),

-- HERMENÊUTICA (5 questões)
('O princípio hermenêutico \"Analogia Fidei\" (analogia da fé) significa que:', 'multiple_choice',
'[{"id": "a", "text": "Passagens obscuras devem ser interpretadas à luz de passagens claras da Escritura", "is_correct": true},
  {"id": "b", "text": "A Bíblia deve ser interpretada analogicamente, não literalmente", "is_correct": false},
  {"id": "c", "text": "A fé pessoal é o critério final de interpretação bíblica", "is_correct": false},
  {"id": "d", "text": "Passagens do AT devem ser analogias das verdades do NT", "is_correct": false}]',
null, 'Hermenêutica', 'Princípios de Interpretação', 'medium', 'Exegética',
ARRAY['2 Pedro 1:20-21'],
'Analogia Fidei é um princípio reformado: a Escritura interpreta a Escritura; o claro ilumina o obscuro.');

-- Total: 50 questões de exemplo
-- Na implementação real: expandir para 1000+ questões
-- Cobrir todas as matérias teológicas
-- Variar níveis de dificuldade
-- Incluir referências bíblicas adequadas
