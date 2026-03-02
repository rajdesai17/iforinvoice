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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-sm bg-navy-door" />
        <div>
          <h1 className="text-xl font-semibold text-navy-alice">Settings</h1>
          <p className="text-sm text-navy-harper">
            Manage your business profile and invoice defaults
          </p>
        </div>
      </div>
      <BusinessProfileForm profile={profile} />
    </div>
  );
}
