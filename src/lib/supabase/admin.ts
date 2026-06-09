import type { UserRole } from "@/types";
import { supabase } from "./client";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  companies: { id: string; name: string; code: string; is_primary: boolean }[];
  created_at: string;
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("get_all_users_for_admin");
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw error;
}

export async function addUserCompany(
  userId: string,
  companyId: string,
  isPrimary: boolean = false
): Promise<void> {
  // If setting as primary, unset others first
  if (isPrimary) {
    await supabase
      .from("user_companies")
      .update({ is_primary: false })
      .eq("user_id", userId);
  }
  const { error } = await supabase
    .from("user_companies")
    .upsert({ user_id: userId, company_id: companyId, is_primary: isPrimary });
  if (error) throw error;
}

export async function removeUserCompany(userId: string, companyId: string): Promise<void> {
  const { error } = await supabase
    .from("user_companies")
    .delete()
    .eq("user_id", userId)
    .eq("company_id", companyId);
  if (error) throw error;
}
