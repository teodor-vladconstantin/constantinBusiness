"use server";

import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/admin-auth";
import { site } from "@/lib/site";
import { createSupabaseServer } from "@/lib/supabase/server";

export type LoginState = { sent: boolean };

// The reply is the same for every address, so the form does not reveal which address is the admin.
export async function sendLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  if (isAdminEmail(email)) {
    const origin = (await headers()).get("origin") ?? site.url;
    const supabase = await createSupabaseServer();
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/callback` },
    });
  }
  return { sent: true };
}
