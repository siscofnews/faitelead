-- Create approval function for checking if user can approve
CREATE OR REPLACE FUNCTION public.can_approve_user(_approver_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _approver_role app_role;
  _user_role app_role;
  _approver_polo_id uuid;
  _user_polo_id uuid;
BEGIN
  -- Get approver's highest role
  SELECT role INTO _approver_role FROM user_roles WHERE user_id = _approver_id ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1 
      WHEN 'admin' THEN 2 
      WHEN 'polo_director' THEN 3
      ELSE 4 
    END LIMIT 1;
  
  -- Get user's role
  SELECT role INTO _user_role FROM user_roles WHERE user_id = _user_id LIMIT 1;
  
  -- Super admin can approve admins
  IF _approver_role = 'super_admin' AND _user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Get polo IDs
  SELECT polo_id INTO _approver_polo_id FROM profiles WHERE id = _approver_id;
  SELECT polo_id INTO _user_polo_id FROM profiles WHERE id = _user_id;
  
  -- Polo director can approve teachers and students from same polo
  IF _approver_role = 'polo_director' AND _user_role IN ('teacher', 'student') AND _approver_polo_id = _user_polo_id THEN
    RETURN true;
  END IF;
  
  -- Admin can also approve teachers and students
  IF _approver_role IN ('super_admin', 'admin') AND _user_role IN ('teacher', 'student') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);