"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  AuthenticationError,
  requireCurrentUserId,
} from "@/lib/auth/current-user";
import { fail, ok, type ActionResult } from "@/lib/server/action-response";
import { logServerError } from "@/lib/server/logger";
import { profileInputSchema } from "@/lib/validations/actions";

export async function updateBusinessProfile(
  data: unknown,
): Promise<ActionResult<{ profileUpdated: true }>> {
  const parsedInput = profileInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid profile input");
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsedInput.data;

    const [existing] = await db
      .select({ id: businessProfiles.id })
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    const profileData = {
      businessName: payload.businessName || null,
      email: payload.email || null,
      phone: payload.phone || null,
      addressLine1: payload.addressLine1 || null,
      addressLine2: payload.addressLine2 || null,
      city: payload.city || null,
      state: payload.state || null,
      postalCode: payload.postalCode || null,
      country: payload.country || null,
      taxId: payload.taxId || null,
      defaultPaymentTerms: payload.defaultPaymentTerms ?? 30,
      invoicePrefix: payload.invoicePrefix || "INV",
      invoiceNotes: payload.invoiceNotes || null,
      invoiceFooter: payload.invoiceFooter || null,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(businessProfiles)
        .set(profileData)
        .where(eq(businessProfiles.userId, userId));
    } else {
      await db.insert(businessProfiles).values({
        userId,
        ...profileData,
      });
    }

    revalidatePath("/settings");
    revalidatePath("/invoices/new");

    return ok("Profile updated", { profileUpdated: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("settings.updateBusinessProfile", error);
    return fail("INTERNAL_ERROR", "Failed to update profile");
  }
}
