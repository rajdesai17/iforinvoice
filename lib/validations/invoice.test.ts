import { describe, expect, it } from "vitest";
import {
  calculateInvoiceTotals,
  invoiceFormSchema,
  type InvoiceFormData,
} from "@/lib/validations/invoice";

describe("calculateInvoiceTotals", () => {
  it("calculates subtotal, tax, discount, and total", () => {
    const totals = calculateInvoiceTotals(
      [
        { id: "1", description: "Design", quantity: 2, unitPrice: 100, amount: 200 },
        { id: "2", description: "Development", quantity: 3, unitPrice: 50, amount: 150 },
      ],
      10,
      "percentage",
      20,
    );

    expect(totals.subtotal).toBe(350);
    expect(totals.taxAmount).toBe(35);
    expect(totals.discountAmount).toBe(70);
    expect(totals.total).toBe(315);
  });
});

describe("invoiceFormSchema", () => {
  it("rejects due date before issue date", () => {
    const invalidData: InvoiceFormData = {
      clientId: "00000000-0000-0000-0000-000000000001",
      invoiceNumber: "INV-0001",
      issueDate: new Date("2026-03-10"),
      dueDate: new Date("2026-03-09"),
      currency: "USD",
      lineItems: [
        {
          id: "1",
          description: "Item",
          quantity: 1,
          unitPrice: 10,
          amount: 10,
        },
      ],
      taxRate: 0,
      discountType: "percentage",
      discountValue: 0,
      notes: "",
      terms: "",
    };

    const result = invoiceFormSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
  });
});
