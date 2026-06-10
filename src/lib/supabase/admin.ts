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

export interface CompanyChangeLog {
  id: string;
  user_name: string;
  user_email: string;
  changed_by_name: string;
  action: "add" | "remove" | "set_primary";
  company_name: string;
  created_at: string;
}

export interface RoleChangeLog {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  changed_by: string;
  changed_by_name: string;
  old_role: string;
  new_role: string;
  note: string | null;
  created_at: string;
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("get_all_users_for_admin");
  if (error) throw error;
  return (data ?? []) as AdminUser[];
}

export async function updateUserRole(userId: string, role: UserRole, oldRole: UserRole): Promise<void> {
  // 1. Update role via SECURITY DEFINER function (bypasses RLS)
  const { data: rpcResult, error } = await supabase.rpc("admin_update_user_role", {
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw error;
  // Log is recorded inside the SQL function (SECURITY DEFINER) — no client-side insert needed
}

export async function fetchCompanyChangeLogs(): Promise<CompanyChangeLog[]> {
  try {
    const { data, error } = await supabase.rpc("get_company_change_logs");
    if (error) throw error;
    return (data ?? []) as CompanyChangeLog[];
  } catch {
    return [];
  }
}

export async function fetchRoleChangeLogs(userId?: string): Promise<RoleChangeLog[]> {
  try {
    const { data, error } = await supabase.rpc("get_role_change_logs", userId ? { p_user_id: userId } : {});
    if (error) throw error;
    return (data ?? []) as RoleChangeLog[];
  } catch {
    // RPC function not created yet — return empty
    return [];
  }
}

export async function addUserCompany(
  userId: string,
  companyId: string,
  isPrimary: boolean = false
): Promise<void> {
  if (isPrimary) {
    await supabase.from("user_companies").update({ is_primary: false }).eq("user_id", userId);
  }
  const { error } = await supabase
    .from("user_companies")
    .upsert({ user_id: userId, company_id: companyId, is_primary: isPrimary });
  if (error) throw error;
  // Log (best-effort)
  try { await supabase.rpc("log_company_change", { p_user_id: userId, p_action: "add", p_company_id: companyId }); } catch { /* ignore */ }
}

export async function removeUserCompany(userId: string, companyId: string): Promise<void> {
  const { error } = await supabase
    .from("user_companies")
    .delete()
    .eq("user_id", userId)
    .eq("company_id", companyId);
  if (error) throw error;
  // Log (best-effort)
  try { await supabase.rpc("log_company_change", { p_user_id: userId, p_action: "remove", p_company_id: companyId }); } catch { /* ignore */ }
}

export async function setPrimaryCompany(userId: string, companyId: string): Promise<void> {
  await supabase.from("user_companies").update({ is_primary: false }).eq("user_id", userId);
  const { error } = await supabase
    .from("user_companies")
    .update({ is_primary: true })
    .eq("user_id", userId)
    .eq("company_id", companyId);
  if (error) throw error;
  // Log (best-effort)
  try { await supabase.rpc("log_company_change", { p_user_id: userId, p_action: "set_primary", p_company_id: companyId }); } catch { /* ignore */ }
}
