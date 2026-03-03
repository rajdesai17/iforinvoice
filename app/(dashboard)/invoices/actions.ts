"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  invoices,
  invoiceLineItems,
  businessProfiles,
  clients,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  AuthenticationError,
  requireCurrentUserId,
} from "@/lib/auth/current-user";
import { fail, ok, type ActionResult } from "@/lib/server/action-response";
import { logServerError } from "@/lib/server/logger";
import {
  createInvoiceInputSchema,
  idSchema,
  invoiceStatusSchema,
  saveDraftInputSchema,
} from "@/lib/validations/actions";

type InvoiceRecord = typeof invoices.$inferSelect;

export async function createInvoice(
  data: unknown,
): Promise<ActionResult<{ invoice: InvoiceRecord }>> {
  const parsedInput = createInvoiceInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid invoice input");
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsedInput.data;

    const [client] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(
          eq(clients.id, payload.clientId),
          eq(clients.userId, userId),
          eq(clients.isArchived, false),
        ),
      )
      .limit(1);

    if (!client) {
      throw new Error("CLIENT_NOT_FOUND");
    }

    const [existingInvoice] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.invoiceNumber, payload.invoiceNumber),
        ),
      )
      .limit(1);

    if (existingInvoice) {
      throw new Error("INVOICE_NUMBER_EXISTS");
    }

    const [createdInvoice] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: payload.clientId,
        invoiceNumber: payload.invoiceNumber,
        status: payload.status,
        issueDate: payload.issueDate,
        dueDate: payload.dueDate,
        currency: payload.currency,
        subtotal: payload.subtotal.toString(),
        taxRate: payload.taxRate.toString(),
        taxAmount: payload.taxAmount.toString(),
        discountType: payload.discountType,
        discountValue: payload.discountValue.toString(),
        discountAmount: payload.discountAmount.toString(),
        total: payload.total.toString(),
        notes: payload.notes || null,
        terms: payload.terms || null,
      })
      .returning();

    try {
      await db.insert(invoiceLineItems).values(
        payload.lineItems.map((item, index) => ({
          invoiceId: createdInvoice.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          amount: item.amount.toString(),
          sortOrder: index,
        })),
      );
    } catch (lineItemsError) {
      // Best-effort rollback when running on drivers without transaction support.
      await db
        .delete(invoices)
        .where(
          and(eq(invoices.id, createdInvoice.id), eq(invoices.userId, userId)),
        );
      throw lineItemsError;
    }

    const [profile] = await db
      .select({
        id: businessProfiles.id,
        nextInvoiceNumber: businessProfiles.nextInvoiceNumber,
      })
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    if (profile) {
      await db
        .update(businessProfiles)
        .set({
          nextInvoiceNumber: (profile.nextInvoiceNumber || 1) + 1,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.id, profile.id));
    } else {
      await db.insert(businessProfiles).values({
        userId,
        nextInvoiceNumber: 2,
      });
    }

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    revalidatePath("/invoices/new");

    return ok("Invoice created", { invoice: createdInvoice });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }

    if (error instanceof Error && error.message === "CLIENT_NOT_FOUND") {
      return fail("NOT_FOUND", "Client not found for current user");
    }

    if (error instanceof Error && error.message === "INVOICE_NUMBER_EXISTS") {
      return fail("CONFLICT", "Invoice number already exists");
    }

    logServerError("invoices.createInvoice", error);
    return fail("INTERNAL_ERROR", "Failed to create invoice");
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: string,
): Promise<ActionResult<{ invoice: InvoiceRecord }>> {
  const parsedId = idSchema.safeParse(invoiceId);
  if (!parsedId.success) {
    return fail("VALIDATION_ERROR", "Invalid invoice id");
  }

  const parsedStatus = invoiceStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return fail("VALIDATION_ERROR", "Invalid invoice status");
  }

  try {
    const userId = await requireCurrentUserId();
    const nextStatus = parsedStatus.data;

    const updateData: Partial<InvoiceRecord> = {
      status: nextStatus,
      updatedAt: new Date(),
      paidAt: nextStatus === "paid" ? new Date() : null,
    };

    const [invoice] = await db
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.id, parsedId.data), eq(invoices.userId, userId)))
      .returning();

    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found");
    }

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    revalidatePath(`/invoices/${invoiceId}`);

    return ok("Invoice status updated", { invoice });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }

    logServerError("invoices.updateInvoiceStatus", error, {
      invoiceId,
      status,
    });
    return fail("INTERNAL_ERROR", "Failed to update invoice status");
  }
}

export async function deleteInvoice(
  invoiceId: string,
): Promise<ActionResult<{ invoiceId: string }>> {
  const parsedId = idSchema.safeParse(invoiceId);
  if (!parsedId.success) {
    return fail("VALIDATION_ERROR", "Invalid invoice id");
  }

  try {
    const userId = await requireCurrentUserId();

    const [invoice] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, parsedId.data), eq(invoices.userId, userId)))
      .returning({ id: invoices.id });

    if (!invoice) {
      return fail("NOT_FOUND", "Invoice not found");
    }

    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return ok("Invoice deleted", { invoiceId: invoice.id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }

    logServerError("invoices.deleteInvoice", error, { invoiceId });
    return fail("INTERNAL_ERROR", "Failed to delete invoice");
  }
}

export async function saveDraft(
  data: unknown,
): Promise<ActionResult<{ draftSaved: true; invoiceNumber: string }>> {
  const parsedInput = saveDraftInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid draft input");
  }

  try {
    await requireCurrentUserId();
    const payload = parsedInput.data;

    // Placeholder until drafts persistence is introduced.
    return ok("Draft saved", {
      draftSaved: true,
      invoiceNumber: payload.invoiceNumber,
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }

    logServerError("invoices.saveDraft", error);
    return fail("INTERNAL_ERROR", "Failed to save draft");
  }
}
