-- Create enrollment_permissions table for managing special enrollment permissions
CREATE TABLE IF NOT EXISTS enrollment_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_by_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  allow_multiple_courses BOOLEAN DEFAULT true,
  specific_courses UUID[] DEFAULT ARRAY[]::UUID[],
  max_concurrent_courses INTEGER DEFAULT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoke_reason TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollment_permissions_student ON enrollment_permissions(student_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_enrollment_permissions_expires ON enrollment_permissions(expires_at) WHERE expires_at IS NOT NULL AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_enrollment_permissions_active ON enrollment_permissions(is_active, student_id);

-- Enable RLS
ALTER TABLE enrollment_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view their own permissions
CREATE POLICY "Students can view their own permissions"
  ON enrollment_permissions FOR SELECT
  USING (student_id = auth.uid());

-- Policy: Admins, directors, and teachers can view all permissions
CREATE POLICY "Staff can view all permissions"
  ON enrollment_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- Policy: Only admins, directors, and teachers can manage permissions
CREATE POLICY "Staff can manage permissions"
  ON enrollment_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'director', 'teacher')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollment_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enrollment_permissions_updated_at
  BEFORE UPDATE ON enrollment_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_permissions_updated_at();

-- Add comments
COMMENT ON TABLE enrollment_permissions IS 'Stores special permissions for students to enroll in multiple courses simultaneously';
COMMENT ON COLUMN enrollment_permissions.specific_courses IS 'Array of course IDs this permission applies to. Empty array means all courses';
COMMENT ON COLUMN enrollment_permissions.max_concurrent_courses IS 'Maximum number of concurrent courses allowed. NULL means unlimited';
