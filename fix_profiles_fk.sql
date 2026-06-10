-- Add FK from transactions.user_id to profiles.id
-- so Supabase can join profiles when querying transactions

ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_user_id_profiles_fkey;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
