-- Create question_bank table for storing exam questions
CREATE TABLE IF NOT EXISTS question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'essay', 'short_answer')),
  category TEXT NOT NULL,
  subcategory TEXT,
  academic_level TEXT NOT NULL CHECK (academic_level IN ('basico', 'medio', 'bacharel', 'graduacao', 'pos_graduacao', 'mestrado', 'doutorado')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  points DECIMAL(5,2) DEFAULT 1.00,
  correct_answer TEXT,
  explanation TEXT,
  biblical_references TEXT[],
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create question_options table for multiple choice questions
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES question_bank(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  option_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category, academic_level);
CREATE INDEX IF NOT EXISTS idx_question_bank_level ON question_bank(academic_level);
CREATE INDEX IF NOT EXISTS idx_question_bank_active ON question_bank(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_question_bank_type ON question_bank(question_type);
CREATE INDEX IF NOT EXISTS idx_question_options_question ON question_options(question_id);

-- Enable RLS
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_bank
CREATE POLICY "Anyone can view active questions"
  ON question_bank FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage questions"
  ON question_bank FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- RLS Policies for question_options
CREATE POLICY "Anyone can view options for active questions"
  ON question_options FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM question_bank
      WHERE id = question_options.question_id
      AND is_active = true
    )
  );

CREATE POLICY "Staff can manage options"
  ON question_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_question_bank_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER question_bank_updated_at
  BEFORE UPDATE ON question_bank
  FOR EACH ROW
  EXECUTE FUNCTION update_question_bank_updated_at();

-- Comments
COMMENT ON TABLE question_bank IS 'Stores exam questions for all courses and academic levels';
COMMENT ON COLUMN question_bank.category IS 'Main category: Teologia, Bíblia, Ciências, Cultura';
COMMENT ON COLUMN question_bank.subcategory IS 'Specific subject within category';
COMMENT ON COLUMN question_bank.academic_level IS 'Academic level: basico, medio, bacharel, graduacao, pos_graduacao, mestrado, doutorado';
COMMENT ON COLUMN question_bank.biblical_references IS 'Array of biblical references (e.g., João 3:16, Atos 2:1-4)';
COMMENT ON COLUMN question_bank.tags IS 'Array of tags for categorization and search';
