import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { email, full_name } = await req.json();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const supabase = createServiceClient();
  await supabase.from("pending_registrations").upsert(
    { email, full_name, status: "pending" },
    { onConflict: "email" }
  );

  return NextResponse.json({ ok: true });
}
