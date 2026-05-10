import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatApp from "./ChatApp";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <ChatApp userEmail={user.email ?? ""} />;
}
