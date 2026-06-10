-- ============================================================
-- RUN_ALL_FIXES.sql
-- รันไฟล์นี้ใน Supabase SQL Editor ทั้งหมดในครั้งเดียว
-- ============================================================

-- ============================================================
-- PART 1: wait role + trigger สร้าง profile อัตโนมัติ
-- ============================================================

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'user', 'wait'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'wait',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 2: admin_update_user_role — แก้ปัญหาเปลี่ยน role ไม่ได้
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_user_id uuid,
  p_role    text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied: admin only';
  END IF;
  IF p_role NOT IN ('admin', 'user', 'wait') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;
  UPDATE profiles SET role = p_role WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- PART 3: role_change_logs — ประวัติการเปลี่ยนสิทธิ์
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_change_logs (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  changed_by  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_role    text NOT NULL,
  new_role    text NOT NULL,
  note        text,
  created_at  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE role_change_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can read logs" ON role_change_logs;
DROP POLICY IF EXISTS "Admin can insert logs" ON role_change_logs;

CREATE POLICY "Admin can read logs"
  ON role_change_logs FOR SELECT
  USING (get_my_role() = 'admin');

CREATE POLICY "Admin can insert logs"
  ON role_change_logs FOR INSERT
  WITH CHECK (get_my_role() = 'admin');

CREATE INDEX IF NOT EXISTS role_change_logs_user_id_idx  ON role_change_logs(user_id);
CREATE INDEX IF NOT EXISTS role_change_logs_created_at_idx ON role_change_logs(created_at DESC);

CREATE OR REPLACE FUNCTION public.get_role_change_logs(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid, user_id uuid, user_name text, user_email text,
  changed_by uuid, changed_by_name text,
  old_role text, new_role text, note text, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF get_my_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  RETURN QUERY
  SELECT
    l.id, l.user_id,
    COALESCE(p_target.full_name, 'Unknown')  AS user_name,
    COALESCE(au_target.email, 'Unknown')      AS user_email,
    l.changed_by,
    COALESCE(p_changer.full_name, 'Unknown') AS changed_by_name,
    l.old_role, l.new_role, l.note, l.created_at
  FROM role_change_logs l
  LEFT JOIN profiles   p_target  ON p_target.id  = l.user_id
  LEFT JOIN auth.users au_target ON au_target.id = l.user_id
  LEFT JOIN profiles   p_changer ON p_changer.id = l.changed_by
  WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
  ORDER BY l.created_at DESC
  LIMIT 200;
END;
$$;

-- ============================================================
-- PART 4: FK สำหรับดึงชื่อผู้สร้าง transaction
-- ============================================================

ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_user_id_profiles_fkey;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- ============================================================
-- เสร็จแล้ว — รัน 4 ส่วนนี้ครบ ระบบจะทำงานได้ครบทุกฟีเจอร์
-- ============================================================
