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

export async function GET() {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createServiceClient();
  const { data } = await supabase.from("app_config").select("key, value");

  const config: Record<string, string> = {};
  for (const row of data ?? []) config[row.key] = row.value ?? "";

  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates: Record<string, string> = await req.json();
  const supabase = createServiceClient();

  for (const [key, value] of Object.entries(updates)) {
    await supabase.from("app_config").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  }

  return NextResponse.json({ ok: true });
}
