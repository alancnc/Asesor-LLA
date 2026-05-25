import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ShellLayout from "@/components/layout/ShellLayout";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <ShellLayout
      user={{ email: user.email ?? "", full_name: profile?.full_name ?? "" }}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </ShellLayout>
  );
}
