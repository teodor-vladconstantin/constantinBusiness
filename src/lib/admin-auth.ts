import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export function isAdminEmail(email?: string | null): boolean {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return !!admin && !!email && email.trim().toLowerCase() === admin;
}

// Call at the top of every admin page and action. getUser() asks Supabase to validate the session.
export async function requireAdmin(): Promise<{ email: string }> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email;
  if (!email || !isAdminEmail(email)) redirect("/login");
  return { email };
}
