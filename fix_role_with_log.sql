-- fix_role_with_log.sql
-- อัปเดต admin_update_user_role ให้บันทึก log ภายใน function เดียวกัน
-- (SECURITY DEFINER ข้าม RLS ได้ทั้งหมด)

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
  old_role    text;
  target_name text;
BEGIN
  -- ตรวจสอบสิทธิ์ผู้เรียก
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  IF caller_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Access denied: caller role = %', COALESCE(caller_role, 'NULL');
  END IF;

  IF p_role NOT IN ('admin', 'user', 'wait') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  -- ดึง role เดิม
  SELECT role INTO old_role FROM public.profiles WHERE id = p_user_id;

  -- ดึงชื่อจาก auth.users สำหรับ upsert
  SELECT COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
  INTO target_name
  FROM auth.users WHERE id = p_user_id;

  IF target_name IS NULL THEN
    RAISE EXCEPTION 'Auth user not found: %', p_user_id;
  END IF;

  -- UPSERT profile + update role
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (p_user_id, target_name, p_role, NOW())
  ON CONFLICT (id) DO UPDATE SET role = p_role;

  -- บันทึก log (ไม่ขึ้นกับ RLS เพราะอยู่ใน SECURITY DEFINER)
  INSERT INTO public.role_change_logs (user_id, changed_by, old_role, new_role)
  VALUES (p_user_id, auth.uid(), COALESCE(old_role, 'wait'), p_role);

  RETURN 'ok';
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;

SELECT 'done' AS status;
