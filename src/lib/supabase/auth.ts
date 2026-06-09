import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types";
import { supabase } from "./client";

export async function mapSupabaseUser(user: SupabaseUser): Promise<User> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, company_id")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : undefined;

  return {
    id: user.id,
    email: user.email ?? "",
    name:
      profile?.full_name ??
      metadataName ??
      user.email?.split("@")[0] ??
      "User",
    role: profile?.role ?? "user",
    companyId: profile?.company_id ?? null,
  };
}
