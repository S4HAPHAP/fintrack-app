-- 1. Create role_change_logs table
CREATE TABLE IF NOT EXISTS public.role_change_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_role    text NOT NULL,
  new_role    text NOT NULL,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- 2. RLS: only admin can read/insert
ALTER TABLE role_change_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read logs"
  ON role_change_logs FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "Admin can insert logs"
  ON role_change_logs FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

-- 3. Index for fast lookup by user
CREATE INDEX IF NOT EXISTS role_change_logs_user_id_idx ON role_change_logs(user_id);
CREATE INDEX IF NOT EXISTS role_change_logs_created_at_idx ON role_change_logs(created_at DESC);

-- 4. SECURITY DEFINER function to get logs with names (bypasses RLS for join)
CREATE OR REPLACE FUNCTION public.get_role_change_logs(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid, user_id uuid, user_name text, user_email text,
  changed_by uuid, changed_by_name text,
  old_role text, new_role text, note text, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only admin can call this
  IF get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT
    l.id, l.user_id,
    COALESCE(p_target.full_name, 'Unknown') AS user_name,
    COALESCE(au_target.email, 'Unknown') AS user_email,
    l.changed_by,
    COALESCE(p_changer.full_name, 'Unknown') AS changed_by_name,
    l.old_role, l.new_role, l.note, l.created_at
  FROM role_change_logs l
  LEFT JOIN profiles p_target ON p_target.id = l.user_id
  LEFT JOIN auth.users au_target ON au_target.id = l.user_id
  LEFT JOIN profiles p_changer ON p_changer.id = l.changed_by
  WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
  ORDER BY l.created_at DESC
  LIMIT 200;
END;
$$;
