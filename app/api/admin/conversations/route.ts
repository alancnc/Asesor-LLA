import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ADMIN_EMAIL } from "@/lib/constants";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function GET(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? "";

  const supabase = createServiceClient();

  const [
    { data: { users } },
    { data: profiles },
    { data: convs },
    { data: msgs },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from("profiles").select("id, full_name"),
    supabase.from("conversations").select("id, title, user_id, created_at, updated_at").order("updated_at", { ascending: false }),
    supabase.from("messages").select("conversation_id"),
  ]);

  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? ""]));
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));
  const msgCountMap: Record<string, number> = {};
  for (const m of msgs ?? []) {
    msgCountMap[m.conversation_id] = (msgCountMap[m.conversation_id] ?? 0) + 1;
  }

  let result = (convs ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    user_id: c.user_id,
    user_email: emailMap[c.user_id] ?? "",
    user_name: profileMap[c.user_id] ?? emailMap[c.user_id] ?? "",
    created_at: c.created_at,
    updated_at: c.updated_at,
    message_count: msgCountMap[c.id] ?? 0,
  }));

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (r) => r.title.toLowerCase().includes(q) || r.user_name.toLowerCase().includes(q) || r.user_email.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(result);
}
