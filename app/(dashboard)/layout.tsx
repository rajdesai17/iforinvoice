import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireCurrentUserId();

  // Onboarding guard: redirect if no business profile
  const [profile] = await db
    .select({ id: businessProfiles.id })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, userId))
    .limit(1);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar />
      <main className="ml-60 flex-1 p-2 pl-0 h-screen">
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm h-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
