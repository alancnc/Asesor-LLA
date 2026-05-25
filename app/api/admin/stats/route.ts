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
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: { users } },
    { data: regs },
    { data: convsToday },
    { data: convsMonth },
    { data: msgsToday },
    { data: msgsMonth },
    { data: profiles },
    { data: convs },
    { data: msgs30 },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from("pending_registrations").select("status"),
    supabase.from("conversations").select("id").gte("created_at", todayStart),
    supabase.from("conversations").select("id").gte("created_at", monthStart),
    supabase.from("messages").select("id").gte("created_at", todayStart),
    supabase.from("messages").select("id").gte("created_at", monthStart),
    supabase.from("profiles").select("id, full_name"),
    supabase.from("conversations").select("id, user_id"),
    supabase.from("messages").select("created_at").gte("created_at", thirtyDaysAgo),
  ]);

  // Top users by conversation count
  const convCountMap: Record<string, number> = {};
  for (const c of convs ?? []) {
    convCountMap[c.user_id] = (convCountMap[c.user_id] ?? 0) + 1;
  }
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name ?? p.id]));
  const emailMap = Object.fromEntries(users.map((u) => [u.id, u.email ?? ""]));

  const topUsers = Object.entries(convCountMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => ({
      name: profileMap[id] ?? emailMap[id] ?? "Usuario",
      email: emailMap[id] ?? "",
      count,
    }));

  // Daily activity last 30 days
  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const m of msgs30 ?? []) {
    const day = m.created_at.slice(0, 10);
    if (day in dailyMap) dailyMap[day] = (dailyMap[day] ?? 0) + 1;
  }
  const dailyActivity = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    total_users: users.length,
    pending_users: (regs ?? []).filter((r) => r.status === "pending").length,
    conversations_today: convsToday?.length ?? 0,
    conversations_month: convsMonth?.length ?? 0,
    messages_today: msgsToday?.length ?? 0,
    messages_month: msgsMonth?.length ?? 0,
    top_users: topUsers,
    daily_activity: dailyActivity,
  });
}
