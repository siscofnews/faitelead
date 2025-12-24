-- Create polo_staff table
CREATE TABLE IF NOT EXISTS polo_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  polo_id UUID REFERENCES polos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_role TEXT NOT NULL CHECK (staff_role IN ('director', 'secretary', 'treasurer', 'teacher')),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(polo_id, user_id, staff_role)
);

CREATE INDEX idx_polo_staff_polo ON polo_staff(polo_id, is_active) WHERE is_active = true;
CREATE INDEX idx_polo_staff_user ON polo_staff(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_polo_staff_role ON polo_staff(staff_role);

-- Create professor_approvals table
CREATE TABLE IF NOT EXISTS professor_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  polo_id UUID REFERENCES polos(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  notes TEXT,
  UNIQUE(professor_id, polo_id)
);

CREATE INDEX idx_professor_approvals_status ON professor_approvals(status, polo_id);
CREATE INDEX idx_professor_approvals_professor ON professor_approvals(professor_id);

-- Create staff_permissions table
CREATE TABLE IF NOT EXISTS staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  polo_id UUID REFERENCES polos(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('create_lessons', 'create_exams', 'add_questions', 'manage_students', 'view_reports')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, polo_id, permission_type)
);

CREATE INDEX idx_staff_permissions_user ON staff_permissions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_staff_permissions_polo ON staff_permissions(polo_id);

-- Function to check if user has staff permission
CREATE OR REPLACE FUNCTION has_staff_permission(
  check_user_id UUID,
  check_polo_id UUID,
  check_permission TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_permissions
    WHERE user_id = check_user_id
    AND polo_id = check_polo_id
    AND permission_type = check_permission
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is polo director
CREATE OR REPLACE FUNCTION is_polo_director(
  check_user_id UUID,
  check_polo_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM polo_staff
    WHERE user_id = check_user_id
    AND polo_id = check_polo_id
    AND staff_role = 'director'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE polo_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE professor_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_permissions ENABLE ROW LEVEL SECURITY;

-- polo_staff policies
CREATE POLICY "Super admins can manage all polo staff"
  ON polo_staff FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Directors can view their polo staff"
  ON polo_staff FOR SELECT
  USING (
    is_polo_director(auth.uid(), polo_id)
  );

CREATE POLICY "Directors can manage their polo staff"
  ON polo_staff FOR INSERT
  WITH CHECK (
    is_polo_director(auth.uid(), polo_id)
    AND staff_role IN ('secretary', 'treasurer')
  );

-- professor_approvals policies
CREATE POLICY "Professors can view their own approvals"
  ON professor_approvals FOR SELECT
  USING (professor_id = auth.uid());

CREATE POLICY "Directors can view approvals for their polo"
  ON professor_approvals FOR SELECT
  USING (is_polo_director(auth.uid(), polo_id));

CREATE POLICY "Directors can manage approvals for their polo"
  ON professor_approvals FOR ALL
  USING (is_polo_director(auth.uid(), polo_id));

CREATE POLICY "Super admins can manage all approvals"
  ON professor_approvals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- staff_permissions policies
CREATE POLICY "Users can view their own permissions"
  ON staff_permissions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Directors can manage permissions for their polo"
  ON staff_permissions FOR ALL
  USING (is_polo_director(auth.uid(), polo_id));

CREATE POLICY "Super admins can manage all permissions"
  ON staff_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Comments
COMMENT ON TABLE polo_staff IS 'Equipe de cada polo (diretor, secretário, tesoureiro, professor)';
COMMENT ON TABLE professor_approvals IS 'Aprovações de professores pelos diretores de polo';
COMMENT ON TABLE staff_permissions IS 'Permissões específicas para membros da equipe';
COMMENT ON FUNCTION has_staff_permission IS 'Verifica se usuário tem permissão específica em um polo';
COMMENT ON FUNCTION is_polo_director IS 'Verifica se usuário é diretor de um polo';
