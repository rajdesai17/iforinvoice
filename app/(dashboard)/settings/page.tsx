import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BusinessProfileForm } from "@/components/settings/business-profile-form";
import { DEMO_USER_ID } from "../layout";

export const metadata = {
  title: "Settings",
};

async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, userId));
  return profile || null;
}

export default async function SettingsPage() {
  const profile = await getProfile(DEMO_USER_ID);

  return (
    <div className="p-4 lg:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business profile and invoice defaults
        </p>
      </div>
      <BusinessProfileForm profile={profile} />
    </div>
  );
}
