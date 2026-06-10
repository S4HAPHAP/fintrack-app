-- fix_company_log.sql
-- สร้าง company_change_logs + function สำหรับ log การเพิ่ม/ลด/เปลี่ยน primary company

CREATE TABLE IF NOT EXISTS public.company_change_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action      text NOT NULL CHECK (action IN ('add', 'remove', 'set_primary')),
  company_id  uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE company_change_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read company logs"   ON company_change_logs;
DROP POLICY IF EXISTS "Admin can insert company logs" ON company_change_logs;

CREATE POLICY "Admin can read company logs"
  ON company_change_logs FOR SELECT USING (get_my_role() = 'admin');

CREATE POLICY "Admin can insert company logs"
  ON company_change_logs FOR INSERT WITH CHECK (get_my_role() = 'admin');

CREATE INDEX IF NOT EXISTS company_change_logs_user_id_idx
  ON company_change_logs(user_id);
CREATE INDEX IF NOT EXISTS company_change_logs_created_at_idx
  ON company_change_logs(created_at DESC);

-- Function บันทึก log (SECURITY DEFINER ข้าม RLS)
CREATE OR REPLACE FUNCTION public.log_company_change(
  p_user_id    uuid,
  p_action     text,
  p_company_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.company_change_logs (user_id, changed_by, action, company_id)
  VALUES (p_user_id, auth.uid(), p_action, p_company_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_company_change(uuid, text, uuid) TO authenticated;

-- Function ดึง logs พร้อมชื่อ
CREATE OR REPLACE FUNCTION public.get_company_change_logs()
RETURNS TABLE (
  id              uuid,
  user_name       text,
  user_email      text,
  changed_by_name text,
  action          text,
  company_name    text,
  created_at      timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF get_my_role() != 'admin' THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
  SELECT
    l.id,
    COALESCE(pu.full_name,   'Unknown')::text,
    COALESCE(au.email::text, 'Unknown')::text,
    COALESCE(pc.full_name,   'Unknown')::text,
    l.action::text,
    COALESCE(co.name,        'Unknown')::text,
    l.created_at
  FROM company_change_logs l
  LEFT JOIN profiles   pu ON pu.id = l.user_id
  LEFT JOIN auth.users au ON au.id = l.user_id
  LEFT JOIN profiles   pc ON pc.id = l.changed_by
  LEFT JOIN companies  co ON co.id = l.company_id
  ORDER BY l.created_at DESC
  LIMIT 200;
END;
$$;

SELECT 'company_change_logs ready' AS status;
