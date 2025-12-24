-- Update profiles table for simplified student registration
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS birthplace TEXT,
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_registration_status ON profiles(registration_status);

-- Create registration_links table
CREATE TABLE IF NOT EXISTS registration_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_token UUID UNIQUE DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES auth.users(id),
  polo_id UUID REFERENCES polos(id),
  course_id UUID REFERENCES courses(id),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registration_links_token ON registration_links(link_token);
CREATE INDEX IF NOT EXISTS idx_registration_links_active ON registration_links(is_active) WHERE is_active = true;

ALTER TABLE registration_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for registration_links
CREATE POLICY "Anyone can view active registration links"
  ON registration_links FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Staff can manage registration links"
  ON registration_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- Function to increment link usage
CREATE OR REPLACE FUNCTION increment_link_usage(link_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE registration_links
  SET current_uses = current_uses + 1
  WHERE registration_links.link_token = increment_link_usage.link_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for student photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for student photos
CREATE POLICY "Anyone can upload their photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'student-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'student-photos');

CREATE POLICY "Users can update their photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'student-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Comments
COMMENT ON COLUMN profiles.birthplace IS 'Naturalidade (cidade/estado de nascimento)';
COMMENT ON COLUMN profiles.registration_status IS 'Status do cadastro: pending, approved, rejected';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'Data/hora que aceitou os termos de responsabilidade';
COMMENT ON TABLE registration_links IS 'Links de cadastro gerados para enviar aos alunos';
