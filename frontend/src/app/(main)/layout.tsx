import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CommandPaletteProvider } from "@/components/features/command-palette";
import { Sidebar } from "@/components/layout/sidebar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Bulletproof server-side check for onboarding completion
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { onboardingComplete: true },
  });

  if (!dbUser || !dbUser.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <CommandPaletteProvider>
      <div className="min-h-screen flex bg-canvas">
        <Sidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </CommandPaletteProvider>
  );
}
