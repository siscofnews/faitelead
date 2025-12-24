-- ============================================
-- BANCO DE QUESTÕES - Sistema de Questões
-- ============================================
-- 1000+ questões teológicas organizadas por matéria
-- Nível acadêmico (não fáceis)
-- Geração automática de provas
-- ============================================

-- Tabela de Banco de Questões
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conteúdo
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' 
    CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
  
  -- Opções (JSON para múltipla escolha)
  options JSONB, -- [{"id": "a", "text": "...", "is_correct": true}]
  correct_answer TEXT,
  explanation TEXT, -- Explicação da resposta
  
  -- Classificação
  subject TEXT NOT NULL, -- Matéria (Bibliologia, Teologia Sistemática, etc)
  topic TEXT, -- Tópico específico dentro da matéria
  difficulty TEXT DEFAULT 'medium' 
    CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  
  -- Metadata
  points DECIMAL DEFAULT 1.0,
  estimated_time_seconds INT DEFAULT 120, -- Tempo estimado para responder
  
  -- Referências
  bible_references TEXT[], -- Versículos relacionados
  theological_area TEXT, -- Área teológica (Sistemática, Exegética, Histórica, Prática)
  
  -- Controle
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  times_used INT DEFAULT 0, -- Quantas vezes foi usada
  correct_rate DECIMAL, -- Taxa de acertos (%)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_topic ON question_bank(topic);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_area ON question_bank(theological_area);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON question_bank(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_question_bank_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_bank_timestamp
  BEFORE UPDATE ON question_bank
  FOR EACH ROW
  EXECUTE FUNCTION update_question_bank_updated_at();

-- Função para gerar prova a partir do banco de questões
CREATE OR REPLACE FUNCTION generate_exam_from_bank(
  p_exam_id UUID,
  p_subject TEXT,
  p_total_questions INT DEFAULT 10,
  p_difficulty TEXT DEFAULT 'medium'
)
RETURNS TABLE(question_id UUID, question_order INT) AS $$
DECLARE
  v_question RECORD;
  v_order INT := 1;
BEGIN
  -- Selecionar questões aleatórias do banco
  FOR v_question IN 
    SELECT id FROM question_bank
    WHERE subject = p_subject
      AND difficulty = p_difficulty
      AND is_active = true
    ORDER BY RANDOM()
    LIMIT p_total_questions
  LOOP
    -- Copiar questão para a prova
    INSERT INTO exam_questions (
      exam_id,
      question_text,
      question_type,
      options,
      correct_answer,
      points,
      order_index
    )
    SELECT 
      p_exam_id,
      question_text,
      question_type,
      options,
      correct_answer,
      points,
      v_order
    FROM question_bank
    WHERE id = v_question.id;
    
    -- Incrementar contador de uso
    UPDATE question_bank 
    SET times_used = times_used + 1 
    WHERE id = v_question.id;
    
    -- Retornar para tracking
    question_id := v_question.id;
    question_order := v_order;
    RETURN NEXT;
    
    v_order := v_order + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Admins podem tudo
CREATE POLICY "Admins can manage question bank" ON question_bank
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
  );

-- Professores podem ver
CREATE POLICY "Professors can view questions" ON question_bank
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'professor')
  );

-- Matérias Teológicas Principais
COMMENT ON TABLE question_bank IS 'Banco de 1000+ questões teológicas organizadas por matéria e dificuldade';

-- Matérias suportadas:
-- - Bibliologia (Doutrina das Escrituras)
-- - Teontologia (Doutrina de Deus)
-- - Cristologia (Doutrina de Cristo)
-- - Pneumatologia (Doutrina do Espírito Santo)
-- - Angelologia (Doutrina dos Anjos)
-- - Antropologia (Doutrina do Homem)
-- - Hamartiologia (Doutrina do Pecado)
-- - Soteriologia (Doutrina da Salvação)
-- - Eclesiologia (Doutrina da Igreja)
-- - Escatologia (Doutrina das Últimas Coisas)
-- - Hermenêutica (Interpretação Bíblica)
-- - Homilética (Pregação)
-- - História da Igreja
-- - Teologia Prática
-- - Apologética
-- - Missões
-- - Ética Cristã
-- - Línguas Bíblicas (Hebraico, Grego)
