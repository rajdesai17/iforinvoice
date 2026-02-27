"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface ProfileData {
  businessName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId: string;
  defaultPaymentTerms: number;
  invoicePrefix: string;
  invoiceNotes: string;
  invoiceFooter: string;
}

export async function updateBusinessProfile(data: ProfileData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if profile exists
    const [existing] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, session.user.id));

    const profileData = {
      businessName: data.businessName || null,
      email: data.email || null,
      phone: data.phone || null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      state: data.state || null,
      postalCode: data.postalCode || null,
      country: data.country || null,
      taxId: data.taxId || null,
      defaultPaymentTerms: data.defaultPaymentTerms || 30,
      invoicePrefix: data.invoicePrefix || "INV",
      invoiceNotes: data.invoiceNotes || null,
      invoiceFooter: data.invoiceFooter || null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(businessProfiles)
        .set(profileData)
        .where(eq(businessProfiles.userId, session.user.id));
    } else {
      await db.insert(businessProfiles).values({
        userId: session.user.id,
        ...profileData,
      });
    }

    revalidatePath("/settings");
    revalidatePath("/invoices/new");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
