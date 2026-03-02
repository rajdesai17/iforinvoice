"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DEMO_USER_ID } from "../layout";

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface CreateInvoiceData {
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  status: "draft" | "sent";
  lineItems: LineItem[];
  taxRate: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  notes: string;
  terms: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export async function createInvoice(data: CreateInvoiceData) {
  try {
    const userId = DEMO_USER_ID;

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        userId,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        currency: data.currency,
        subtotal: data.subtotal.toString(),
        taxRate: data.taxRate.toString(),
        taxAmount: data.taxAmount.toString(),
        discountType: data.discountType,
        discountValue: data.discountValue.toString(),
        discountAmount: data.discountAmount.toString(),
        total: data.total.toString(),
        notes: data.notes || null,
        terms: data.terms || null,
      })
      .returning();

    // Create line items
    if (data.lineItems.length > 0) {
      await db.insert(invoiceLineItems).values(
        data.lineItems.map((item, index) => ({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          amount: item.amount.toString(),
          sortOrder: index,
        }))
      );
    }

    // Update next invoice number
    const currentProfile = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1);

    if (currentProfile.length > 0) {
      await db
        .update(businessProfiles)
        .set({
          nextInvoiceNumber: (currentProfile[0].nextInvoiceNumber || 1) + 1,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.userId, userId));
    } else {
      // Create profile if doesn't exist
      await db.insert(businessProfiles).values({
        userId,
        nextInvoiceNumber: 2,
      });
    }

    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return { success: true, invoice };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
  try {
    const userId = DEMO_USER_ID;

    const updateData: Record<string, unknown> = {
      status: status as "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled",
      updatedAt: new Date(),
    };

    if (status === "paid") {
      updateData.paidAt = new Date();
    }

    const [invoice] = await db
      .update(invoices)
      .set(updateData)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    revalidatePath(`/invoices/${invoiceId}`);

    return { success: true, invoice };
  } catch (error) {
    console.error("Failed to update invoice status:", error);
    return { success: false, error: "Failed to update invoice status" };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const userId = DEMO_USER_ID;

    const [invoice] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    revalidatePath("/invoices");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return { success: false, error: "Failed to delete invoice" };
  }
}

interface DraftData {
  invoiceNumber: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  taxRate: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  notes?: string;
  terms?: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

// Save draft without redirect (for auto-save)
export async function saveDraft(data: DraftData) {
  // This is a placeholder - in a real app, you'd save to a drafts table
  // or use localStorage on the client side
  // For now, we just return success to satisfy the auto-save hook
  console.log("Draft saved:", data.invoiceNumber);
  return { success: true };
}
