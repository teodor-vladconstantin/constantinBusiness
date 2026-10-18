import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/admin-auth";
import { createSupabaseServer } from "@/lib/supabase/server";

// The login link lands here with a one-time code. Exchange it for a session, then check the address.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getUser();
      if (isAdminEmail(data.user?.email)) return NextResponse.redirect(new URL("/admin/messages", request.url));
      await supabase.auth.signOut();
    }
  }
  return NextResponse.redirect(new URL("/login?error=1", request.url));
}
