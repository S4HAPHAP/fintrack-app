-- ============================================================
-- fix_role_direct.sql
-- แก้ปัญหาเปลี่ยน role ไม่บันทึก
-- รันใน Supabase SQL Editor
-- ============================================================

-- 1. สร้าง function ใหม่ที่ไม่พึ่ง get_my_role() เพื่อหลีกเลี่ยงปัญหา RLS recursion
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_user_id uuid,
  p_role    text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_role text;
  rows_updated int;
BEGIN
  -- ดึง role ของคนเรียกโดยตรงจาก profiles (ไม่ใช้ get_my_role())
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: caller role = %, uid = %',
      COALESCE(caller_role, 'NULL'), auth.uid();
  END IF;

  IF p_role NOT IN ('admin', 'user', 'wait') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  UPDATE public.profiles
  SET role = p_role
  WHERE id = p_user_id;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;

  IF rows_updated = 0 THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  RETURN 'ok:' || rows_updated::text;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;

-- 2. ทดสอบว่า function พร้อมใช้งาน
SELECT proname, prosecdef, prorettype::regtype
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'admin_update_user_role';
