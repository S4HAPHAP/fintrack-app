-- Fix: Create SECURITY DEFINER function for admin to update user roles
-- This bypasses RLS (same pattern as get_all_users_for_admin)

CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_user_id uuid,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only admin can call this
  IF get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;

  -- Validate role value
  IF p_role NOT IN ('admin', 'user', 'wait') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  UPDATE profiles SET role = p_role WHERE id = p_user_id;
END;
$$;
