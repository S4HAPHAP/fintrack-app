-- ============================================================
-- CHECK_STATUS.sql
-- รันใน Supabase SQL Editor เพื่อดูว่าอะไรติดตั้งแล้ว / ยังไม่ได้ติดตั้ง
-- ============================================================

SELECT
  item,
  type,
  CASE WHEN exists_flag THEN '✅ ติดตั้งแล้ว' ELSE '❌ ยังไม่ได้รัน' END AS status
FROM (

  -- Tables
  SELECT 'role_change_logs' AS item, 'Table' AS type,
    EXISTS (SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'role_change_logs') AS exists_flag

  UNION ALL SELECT 'user_companies', 'Table',
    EXISTS (SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'user_companies')

  -- Functions
  UNION ALL SELECT 'get_my_role()', 'Function',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'get_my_role')

  UNION ALL SELECT 'get_my_company_id()', 'Function',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'get_my_company_id')

  UNION ALL SELECT 'get_my_companies()', 'Function',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'get_my_companies')

  UNION ALL SELECT 'get_all_users_for_admin()', 'Function',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'get_all_users_for_admin')

  UNION ALL SELECT 'admin_update_user_role()', 'Function',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'admin_update_user_role')

  UNION ALL SELECT 'get_role_change_logs()', 'Function',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'get_role_change_logs')

  UNION ALL SELECT 'handle_new_user()', 'Function/Trigger',
    EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public' AND p.proname = 'handle_new_user')

  -- Constraints
  UNION ALL SELECT 'profiles_role_check (wait/user/admin)', 'Constraint',
    EXISTS (SELECT 1 FROM information_schema.check_constraints
            WHERE constraint_name = 'profiles_role_check')

  UNION ALL SELECT 'transactions → profiles FK', 'Foreign Key',
    EXISTS (SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'transactions_user_id_profiles_fkey')

  -- Trigger
  UNION ALL SELECT 'on_auth_user_created trigger', 'Trigger',
    EXISTS (SELECT 1 FROM information_schema.triggers
            WHERE trigger_name = 'on_auth_user_created')

) AS checks
ORDER BY type, item;
