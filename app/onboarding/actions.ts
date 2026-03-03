"use server";

import { db } from "@/lib/db";
import { businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { AuthenticationError } from "@/lib/auth/current-user";
import { fail, ok, type ActionResult } from "@/lib/server/action-response";
import { logServerError } from "@/lib/server/logger";
import { z } from "zod";

const onboardingSchema = z.object({
  // Step 1: Business Info
  businessName: z.string().trim().min(1, "Business name is required").max(200),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().default(""),
  addressLine1: z.string().trim().max(500).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  state: z.string().trim().max(100).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  country: z.string().trim().max(100).optional().default(""),

  // Step 2: Invoice Defaults
  invoicePrefix: z.string().trim().min(1).max(20).default("INV"),
  invoiceNumberFormat: z.string().trim().max(100).default("{PREFIX}-{YYYY}-{NUM:4}"),
  defaultCurrency: z.string().trim().max(3).default("USD"),
  defaultPaymentTerms: z.coerce.number().int().min(0).max(365).default(30),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(0),

  // Step 3: Payment Instructions (optional)
  paymentInstructions: z.string().trim().max(5000).optional().default(""),
});

export async function completeOnboarding(
  data: unknown,
): Promise<ActionResult<{ completed: true }>> {
  const parsed = onboardingSchema.safeParse(data);
  if (!parsed.success) {
    return fail(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid input",
    );
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsed.data;

    // Check if profile already exists
    const [existing] = await db
      .select({ id: businessProfiles.id })
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    if (existing) {
      return ok("Profile already exists", { completed: true });
    }

    await db.insert(businessProfiles).values({
      userId,
      businessName: payload.businessName || null,
      email: payload.email || null,
      phone: payload.phone || null,
      addressLine1: payload.addressLine1 || null,
      city: payload.city || null,
      state: payload.state || null,
      postalCode: payload.postalCode || null,
      country: payload.country || null,
      invoicePrefix: payload.invoicePrefix,
      invoiceNumberFormat: payload.invoiceNumberFormat,
      defaultCurrency: payload.defaultCurrency,
      defaultPaymentTerms: payload.defaultPaymentTerms,
      defaultTaxRate: payload.defaultTaxRate.toString(),
      paymentInstructions: payload.paymentInstructions || null,
      nextInvoiceNumber: 1,
    });

    return ok("Onboarding complete", { completed: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("onboarding.completeOnboarding", error);
    return fail("INTERNAL_ERROR", "Failed to complete onboarding");
  }
}
