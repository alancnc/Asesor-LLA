import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatApp from "./ChatApp";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("jurisdiction, response_style, language")
    .eq("id", user.id)
    .single();

  return (
    <ChatApp
      userEmail={user.email ?? ""}
      userProfile={{
        jurisdiction: profile?.jurisdiction ?? "Provincia de Misiones",
        response_style: profile?.response_style ?? "balanced",
        language: profile?.language ?? "es",
      }}
    />
  );
}
