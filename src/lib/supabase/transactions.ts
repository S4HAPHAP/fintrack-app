import type { Transaction, TransactionType } from "@/types";
import { supabase } from "./client";

type TransactionRow = {
  id: string; date: string; type: TransactionType;
  category: string; amount: number; note: string | null;
  project_id: string; created_at: string;
  projects: { name: string } | { name: string }[] | null;
  companies: { name: string } | { name: string }[] | null;
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

export function mapTransactionRow(row: TransactionRow): Transaction {
  return {
    id: row.id, date: row.date, type: row.type, category: row.category,
    amount: Number(row.amount), note: row.note ?? "",
    projectName: getProjectName(row.projects),
    companyName: getCompanyName(row.companies),
  };
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, date, type, category, amount, note, project_id, created_at, projects(name), companies(name)")
    .order("date", { ascending: false });
  if (error) throw error;
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

  // Use passed companyId, or fetch primary company
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

  const { data: created, error } = await supabase
    .from("transactions")
    .insert(payload)
    .select("id, date, type, category, amount, note, project_id, created_at, projects(name), companies(name)")
    .single();
  if (error) throw error;
  return mapTransactionRow(created as TransactionRow);
}

export async function removeTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}
