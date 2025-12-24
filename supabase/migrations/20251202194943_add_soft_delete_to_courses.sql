-- Add soft delete fields to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Create index for soft deleted courses
CREATE INDEX IF NOT EXISTS idx_courses_deleted_at ON courses(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update existing queries to exclude deleted courses by default
-- This is handled in application code with .is('deleted_at', null)

-- Add comment
COMMENT ON COLUMN courses.deleted_at IS 'Timestamp when course was soft deleted';
COMMENT ON COLUMN courses.deleted_by IS 'User who deleted the course';
COMMENT ON COLUMN courses.deletion_reason IS 'Reason for course deletion';
