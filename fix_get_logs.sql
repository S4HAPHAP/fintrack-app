-- fix_get_logs.sql
-- แก้ type mismatch: auth.users.email เป็น varchar ต้อง cast เป็น text

CREATE OR REPLACE FUNCTION public.get_role_change_logs(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id              uuid,
  user_id         uuid,
  user_name       text,
  user_email      text,
  changed_by      uuid,
  changed_by_name text,
  old_role        text,
  new_role        text,
  note            text,
  created_at      timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    l.id,
    l.user_id,
    COALESCE(p_target.full_name,       'Unknown')::text AS user_name,
    COALESCE(au_target.email::text,    'Unknown')::text AS user_email,
    l.changed_by,
    COALESCE(p_changer.full_name,      'Unknown')::text AS changed_by_name,
    l.old_role::text,
    l.new_role::text,
    l.note::text,
    l.created_at
  FROM role_change_logs l
  LEFT JOIN profiles   p_target  ON p_target.id  = l.user_id
  LEFT JOIN auth.users au_target ON au_target.id = l.user_id
  LEFT JOIN profiles   p_changer ON p_changer.id = l.changed_by
  WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
  ORDER BY l.created_at DESC
  LIMIT 200;
END;
$$;

-- ทดสอบทันที
SELECT * FROM get_role_change_logs();
