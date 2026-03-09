"use server";

import { createServerClient } from "@/lib/supabase";
import { mapRowToAppUser, type AppUser, type UserRow } from "@/types/user";

/**
 * Create or update user in Postgres when they log in (Firebase).
 * New users get role="" and organizer="". Existing users only have gmail/updated_at updated (role/organizer preserved).
 */
export async function upsertUserOnLogin(
  id: string,
  gmail: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient();
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("id", id)
      .single();

    const updatedAt = new Date().toISOString();
    if (existing) {
      const { error } = await supabase
        .from("users")
        .update({ gmail, updated_at: updatedAt })
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("users").insert({
        id,
        gmail,
      });
      if (error) throw error;
    }
    return { success: true };
  } catch (e) {
    console.error("upsertUserOnLogin:", e);
    return { success: false, error: String(e) };
  }
}

export async function getAppUser(id: string): Promise<AppUser | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return mapRowToAppUser(data as UserRow);
}
