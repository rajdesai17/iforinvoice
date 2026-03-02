"use client";

import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currencies";
import type { LineItemFormData } from "@/lib/validations/invoice";

interface LineItemRowProps {
  item: LineItemFormData;
  index: number;
  currency: string;
  canDelete: boolean;
  onUpdate: (field: keyof LineItemFormData, value: string | number) => void;
  onRemove: () => void;
  dragHandleProps?: Record<string, unknown>;
}

const inputClassName = "bg-secondary border-0 rounded-xl text-navy-alice placeholder:text-navy-harper focus:ring-2 focus:ring-navy-door h-10";
const labelClassName = "text-xs text-muted-foreground";

export function LineItemRow({
  item,
  index,
  currency,
  canDelete,
  onUpdate,
  onRemove,
  dragHandleProps,
}: LineItemRowProps) {
  return (
    <div className="group space-y-3">
      {index > 0 && <div className="h-px bg-border" />}
      
      <div className="flex gap-2">
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="flex items-center justify-center w-6 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-3">
          {/* Description */}
          <Input
            placeholder="Item description"
            value={item.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            className={inputClassName}
          />

          {/* Quantity, Price, Amount */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className={labelClassName}>Qty</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.quantity}
                onChange={(e) => onUpdate("quantity", parseFloat(e.target.value) || 0)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClassName}>Price</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => onUpdate("unitPrice", parseFloat(e.target.value) || 0)}
                className={inputClassName}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClassName}>Amount</Label>
              <Input
                value={formatCurrency(item.amount, currency)}
                disabled
                className={cn(inputClassName, "text-muted-foreground")}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}
                disabled={!canDelete}
                className={cn(
                  "text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-10 w-10",
                  !canDelete && "opacity-30 cursor-not-allowed"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
