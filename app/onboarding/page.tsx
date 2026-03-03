import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Set Up Your Business",
};

export default async function OnboardingPage() {
  const userId = await requireCurrentUserId();

  // If profile exists, redirect to dashboard
  const [existing] = await db
    .select({ id: businessProfiles.id })
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, userId))
    .limit(1);

  if (existing) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <OnboardingWizard />
      </div>
    </div>
  );
}
