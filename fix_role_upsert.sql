-- fix_role_upsert.sql
-- แก้ "User not found" — user ที่สมัครก่อน trigger จะไม่มี profiles row
-- รันใน Supabase SQL Editor

DROP FUNCTION IF EXISTS public.admin_update_user_role(uuid, text);

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
  target_name text;
BEGIN
  -- ตรวจสอบสิทธิ์ผู้เรียก
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: caller role = %', COALESCE(caller_role, 'NULL');
  END IF;

  IF p_role NOT IN ('admin', 'user', 'wait') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- ดึงชื่อจาก auth.users สำหรับ upsert
  SELECT COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  INTO target_name
  FROM auth.users WHERE id = p_user_id;

  IF target_name IS NULL THEN
    RAISE EXCEPTION 'Auth user not found: %', p_user_id;
  END IF;

  -- UPSERT: สร้าง profile ถ้ายังไม่มี, อัปเดต role ถ้ามีแล้ว
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (p_user_id, target_name, p_role, NOW())
  ON CONFLICT (id) DO UPDATE SET role = p_role;

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;

-- ยืนยัน
SELECT proname, prosecdef FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'admin_update_user_role';
