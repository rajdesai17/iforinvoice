import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/currencies";

// Line item schema
export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Price cannot be negative"),
  amount: z.number(),
});

export type LineItemFormData = z.infer<typeof lineItemSchema>;

// Invoice form schema
export const invoiceFormSchema = z.object({
  clientId: z.string().uuid("Please select a client"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.date(),
  dueDate: z.date(),
  currency: z.enum(CURRENCY_CODES),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  taxRate: z.number().min(0).max(100),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
}).refine((data) => data.dueDate >= data.issueDate, {
  message: "Due date must be on or after issue date",
  path: ["dueDate"],
});

export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

// Default values for the form
export function getDefaultInvoiceValues(
  invoiceNumber: string,
  currency: string = "USD",
  paymentTermsDays: number = 30
): InvoiceFormData {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + paymentTermsDays);

  return {
    clientId: "",
    invoiceNumber,
    issueDate: today,
    dueDate,
    currency: currency as InvoiceFormData["currency"],
    lineItems: [createEmptyLineItem()],
    taxRate: 0,
    discountType: "percentage",
    discountValue: 0,
    notes: "",
    terms: "",
  };
}

// Helper to create empty line item
export function createEmptyLineItem(): LineItemFormData {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  };
}

// Calculate line item amount
export function calculateLineItemAmount(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

// Calculate invoice totals
export interface InvoiceTotals {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export function calculateInvoiceTotals(
  lineItems: LineItemFormData[],
  taxRate: number,
  discountType: "percentage" | "fixed",
  discountValue: number
): InvoiceTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const discountAmount =
    discountType === "percentage"
      ? Math.round(subtotal * (discountValue / 100) * 100) / 100
      : discountValue;
  const total = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;

  return { subtotal, taxAmount, discountAmount, total };
}
