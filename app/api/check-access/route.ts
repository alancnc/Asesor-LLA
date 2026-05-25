import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { ADMIN_EMAIL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ status: "pending" });

  // Admin always approved
  if (email === ADMIN_EMAIL) return NextResponse.json({ status: "approved" });

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("pending_registrations")
    .select("status")
    .eq("email", email)
    .single();

  // No row = legacy user (registered before approval system) — allow
  if (!data) return NextResponse.json({ status: "approved" });

  return NextResponse.json({ status: data.status });
}
