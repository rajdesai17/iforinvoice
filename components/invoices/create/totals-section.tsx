"use client";

import { UseFormReturn } from "react-hook-form";
import type { InvoiceFormData, InvoiceTotals } from "@/lib/validations/invoice";
import { formatCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TotalsSectionProps {
  form: UseFormReturn<InvoiceFormData>;
  totals: InvoiceTotals;
  currency: string;
}

const inputClassName = "bg-[#1a1a1e] border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary h-10";
const labelClassName = "text-xs text-muted-foreground";

export function TotalsSection({ form, totals, currency }: TotalsSectionProps) {
  const { watch, setValue } = form;
  const taxRate = watch("taxRate");
  const discountType = watch("discountType");
  const discountValue = watch("discountValue");

  return (
    <div className="space-y-4">
      {/* Tax & Discount inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={labelClassName}>Tax Rate (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => setValue("taxRate", parseFloat(e.target.value) || 0)}
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className={labelClassName}>Discount</Label>
          <div className="flex gap-2">
            <Select
              value={discountType}
              onValueChange={(v) => setValue("discountType", v as "percentage" | "fixed")}
            >
              <SelectTrigger className={cn(inputClassName, "w-[80px]")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111113] border-[#1e1e21]">
                <SelectItem value="percentage" className="hover:bg-[#1a1a1e]">%</SelectItem>
                <SelectItem value="fixed" className="hover:bg-[#1a1a1e]">$</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={discountValue}
              onChange={(e) => setValue("discountValue", parseFloat(e.target.value) || 0)}
              className={cn(inputClassName, "flex-1")}
            />
          </div>
        </div>
      </div>

      {/* Totals display */}
      <div className="space-y-2 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono">{formatCurrency(totals.subtotal, currency)}</span>
        </div>
        {totals.taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax ({taxRate}%)</span>
            <span className="font-mono">{formatCurrency(totals.taxAmount, currency)}</span>
          </div>
        )}
        {totals.discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Discount {discountType === "percentage" ? `(${discountValue}%)` : ""}
            </span>
            <span className="font-mono text-green-500">
              -{formatCurrency(totals.discountAmount, currency)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
          <span>Total</span>
          <span className="font-mono text-primary">{formatCurrency(totals.total, currency)}</span>
        </div>
      </div>
    </div>
  );
}
