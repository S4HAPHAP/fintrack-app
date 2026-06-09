import type { Company } from "@/types";
import { supabase } from "./client";

export async function fetchCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createCompany(
  payload: Pick<Company, "name" | "code">
): Promise<Company> {
  const { data, error } = await supabase
    .from("companies")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCompany(
  id: string,
  payload: Partial<Pick<Company, "name" | "code">>
): Promise<void> {
  const { error } = await supabase.from("companies").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
}
