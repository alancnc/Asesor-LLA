import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ADMIN_EMAIL } from "@/lib/constants";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function GET() {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createServiceClient();

  const [
    { data: { users } },
    { data: profiles },
    { data: convs },
    { data: regs },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from("profiles").select("id, full_name, avatar_url, profession"),
    supabase.from("conversations").select("id, user_id"),
    supabase.from("pending_registrations").select("email, status, requested_at"),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const regMap = Object.fromEntries((regs ?? []).map((r) => [r.email, r]));
  const convCountMap: Record<string, number> = {};
  for (const c of convs ?? []) {
    convCountMap[c.user_id] = (convCountMap[c.user_id] ?? 0) + 1;
  }

  const result = users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    full_name: profileMap[u.id]?.full_name ?? u.email ?? "",
    avatar_url: profileMap[u.id]?.avatar_url ?? null,
    profession: profileMap[u.id]?.profession ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    status: regMap[u.email ?? ""]?.status ?? "legacy",
    conversation_count: convCountMap[u.id] ?? 0,
  }));

  return NextResponse.json(result);
}
