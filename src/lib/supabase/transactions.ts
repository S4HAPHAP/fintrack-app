import type { Transaction, TransactionType } from "@/types";
import { supabase } from "./client";

type TransactionRow = {
  id: string; date: string; type: TransactionType;
  category: string; amount: number; note: string | null;
  project_id: string; user_id: string; created_at: string;
  projects: { name: string } | { name: string }[] | null;
  companies: { name: string } | { name: string }[] | null;
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
};

function getProjectName(projects: TransactionRow["projects"]): string {
  if (!projects) return "Unknown";
  if (Array.isArray(projects)) return projects[0]?.name ?? "Unknown";
  return projects.name;
}

function getCompanyName(companies: TransactionRow["companies"]): string | null {
  if (!companies) return null;
  if (Array.isArray(companies)) return companies[0]?.name ?? null;
  return companies.name;
}

function getCreatorName(profiles: TransactionRow["profiles"]): string | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0]?.full_name ?? null;
  return profiles.full_name;
}

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id, date: row.date, type: row.type, category: row.category,
    amount: Number(row.amount), note: row.note ?? "",
    projectName: getProjectName(row.projects),
    companyName: getCompanyName(row.companies),
    createdBy: getCreatorName(row.profiles),
    createdAt: row.created_at,
  };
}

const SELECT_BASE = "id, date, type, category, amount, note, project_id, user_id, created_at, projects(name), companies(name)";
const SELECT_WITH_PROFILE = SELECT_BASE + ", profiles!user_id(full_name)";


export async function fetchTransactions(): Promise<Transaction[]> {
  // Try with profiles join first; fall back without if FK missing
  let { data, error } = await supabase
    .from("transactions")
    .select(SELECT_WITH_PROFILE)
    .order("date", { ascending: false });

  if (error) {
    // FK not set up yet — query without profiles join
    const fallback = await supabase
      .from("transactions")
      .select(SELECT_BASE)
      .order("date", { ascending: false });
    if (fallback.error) throw fallback.error;
    data = fallback.data;
  }

  return (data ?? []).map((row) => mapTransactionRow(row as TransactionRow));
}

async function getPrimaryCompanyId(): Promise<string | null> {
  const { data } = await supabase.rpc("get_my_companies");
  if (!data || data.length === 0) return null;
  const primary = (data as any[]).find((c) => c.is_primary) ?? data[0];
  return primary?.id ?? null;
}

async function findOrCreateProject(name: string, companyId: string | null): Promise<string> {
  const trimmed = name.trim();
  const { data: existing } = await supabase
    .from("projects").select("id").eq("name", trimmed).maybeSingle();
  if (existing) return existing.id;

  const payload: Record<string, unknown> = { name: trimmed };
  if (companyId) payload.company_id = companyId;
  const { data: created, error } = await supabase
    .from("projects").insert(payload).select("id").single();
  if (error) throw error;
  return created.id;
}

export async function createTransaction(
  data: Omit<Transaction, "id">,
  companyId?: string | null
): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const effectiveCompanyId = companyId !== undefined
    ? companyId
    : await getPrimaryCompanyId();

  const projectId = await findOrCreateProject(data.projectName, effectiveCompanyId);

  const payload: Record<string, unknown> = {
    date: data.date, type: data.type, category: data.category,
    amount: data.amount, note: data.note,
    project_id: projectId, user_id: user.id,
  };
  if (effectiveCompanyId) payload.company_id = effectiveCompanyId;

  const { data: created, error: insertError } = await supabase
    .from("transactions")
    .insert(payload)
    .select(SELECT_BASE)
    .single();
  if (insertError) throw insertError;

  // Look up creator name from profiles
  const { data: profile } = await supabase
    .from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  return mapTransactionRow({
    ...(created as TransactionRow),
    profiles: profile ? { full_name: profile.full_name } : null,
  });
}

export async function removeTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}
