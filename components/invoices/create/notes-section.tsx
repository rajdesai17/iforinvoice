"use client";

import { UseFormReturn } from "react-hook-form";
import type { InvoiceFormData } from "@/lib/validations/invoice";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  form: UseFormReturn<InvoiceFormData>;
}

const textareaClassName =
  "bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary min-h-[60px] resize-none";
const labelClassName = "text-xs text-muted-foreground";

export function NotesSection({ form }: NotesSectionProps) {
  const { register } = form;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className={labelClassName}>Notes</Label>
        <Textarea
          {...register("notes")}
          placeholder="Any additional notes for your client..."
          rows={2}
          className={cn(textareaClassName)}
        />
      </div>
      <div className="space-y-2">
        <Label className={labelClassName}>Terms & Conditions</Label>
        <Textarea
          {...register("terms")}
          placeholder="Payment terms, late fees, etc..."
          rows={2}
          className={cn(textareaClassName)}
        />
      </div>
    </div>
  );
}
