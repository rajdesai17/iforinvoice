"use client";

import { useMemo } from "react";
import type { InvoiceFormData, InvoiceTotals } from "@/lib/validations/invoice";
import { calculateInvoiceTotals } from "@/lib/validations/invoice";

interface UseInvoiceCalculationsOptions {
  lineItems: InvoiceFormData["lineItems"];
  taxRate: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export function useInvoiceCalculations({
  lineItems,
  taxRate,
  discountType,
  discountValue,
}: UseInvoiceCalculationsOptions): InvoiceTotals {
  return useMemo(() => {
    return calculateInvoiceTotals(lineItems, taxRate, discountType, discountValue);
  }, [lineItems, taxRate, discountType, discountValue]);
}
