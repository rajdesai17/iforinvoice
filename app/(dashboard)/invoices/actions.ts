"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

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
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export async function createInvoice(data: CreateInvoiceData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Create invoice
    const [invoice] = await db
      .insert(invoices)
      .values({
        userId: session.user.id,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
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
      .where(eq(businessProfiles.userId, session.user.id))
      .limit(1);

    if (currentProfile.length > 0) {
      await db
        .update(businessProfiles)
        .set({
          nextInvoiceNumber: (currentProfile[0].nextInvoiceNumber || 1) + 1,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.userId, session.user.id));
    } else {
      // Create profile if doesn't exist
      await db.insert(businessProfiles).values({
        userId: session.user.id,
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

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
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, session.user.id)))
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [invoice] = await db
      .delete(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, session.user.id)))
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
