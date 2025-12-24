-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  forum_type TEXT NOT NULL CHECK (forum_type IN ('staff', 'student')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Initial post content
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create forum_posts table (replies)
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forum_categories_type ON forum_categories(forum_type, display_order);
CREATE INDEX idx_forum_topics_category ON forum_topics(category_id, last_post_at DESC);
CREATE INDEX idx_forum_posts_topic ON forum_posts(topic_id, created_at);

-- RLS Policies
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff_member(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = is_staff_member.user_id
    AND role IN ('admin', 'super_admin', 'director', 'teacher')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories Policies
CREATE POLICY "Public view active categories"
  ON forum_categories FOR SELECT
  USING (
    is_active = true AND (
      forum_type = 'student' OR
      (forum_type = 'staff' AND is_staff_member(auth.uid()))
    )
  );

-- Topics Policies
CREATE POLICY "View topics based on category access"
  ON forum_topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forum_categories
      WHERE id = forum_topics.category_id
      AND (
        forum_type = 'student' OR
        (forum_type = 'staff' AND is_staff_member(auth.uid()))
      )
    )
  );

CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM forum_categories
      WHERE id = category_id
      AND (
        forum_type = 'student' OR
        (forum_type = 'staff' AND is_staff_member(auth.uid()))
      )
    )
  );

CREATE POLICY "Authors and staff can update topics"
  ON forum_topics FOR UPDATE
  USING (
    author_id = auth.uid() OR is_staff_member(auth.uid())
  );

-- Posts Policies
CREATE POLICY "View posts based on topic access"
  ON forum_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forum_topics t
      JOIN forum_categories c ON t.category_id = c.id
      WHERE t.id = forum_posts.topic_id
      AND (
        c.forum_type = 'student' OR
        (c.forum_type = 'staff' AND is_staff_member(auth.uid()))
      )
    )
  );

CREATE POLICY "Authenticated users can create posts"
  ON forum_posts FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM forum_topics t
      JOIN forum_categories c ON t.category_id = c.id
      WHERE t.id = topic_id
      AND (
        c.forum_type = 'student' OR
        (c.forum_type = 'staff' AND is_staff_member(auth.uid()))
      )
    )
  );

CREATE POLICY "Authors and staff can update posts"
  ON forum_posts FOR UPDATE
  USING (
    author_id = auth.uid() OR is_staff_member(auth.uid())
  );

-- Seed Categories
INSERT INTO forum_categories (title, description, slug, forum_type, display_order) VALUES
('Planos de Aula', 'Discussões sobre metodologias e planos de ensino', 'planos-de-aula', 'staff', 1),
('Assuntos Acadêmicos', 'Debates teológicos e pedagógicos', 'assuntos-academicos', 'staff', 2),
('Recursos Didáticos', 'Compartilhamento de materiais e ferramentas', 'recursos-didaticos', 'staff', 3),
('Dúvidas de Prova', 'Espaço para tirar dúvidas sobre avaliações', 'duvidas-prova', 'student', 1),
('Discussão de Aulas', 'Debates sobre o conteúdo das aulas', 'discussao-aulas', 'student', 2),
('Café Teológico', 'Interação livre entre alunos', 'cafe-teologico', 'student', 3);
