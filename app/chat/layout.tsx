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

  // Fetch profile for name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <ShellLayout
      user={{
        email: user.email ?? "",
        full_name: profile?.full_name ?? "",
      }}
    >
      {children}
    </ShellLayout>
  );
}
