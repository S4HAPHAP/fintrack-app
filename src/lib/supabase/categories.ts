import type { Category, TransactionType } from "@/types";
import { supabase } from "./client";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("type")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  payload: Pick<Category, "name_en" | "name_th" | "type" | "sort_order">
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  payload: Partial<Pick<Category, "name_en" | "name_th" | "is_active" | "sort_order">>
): Promise<void> {
  const { error } = await supabase.from("categories").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
