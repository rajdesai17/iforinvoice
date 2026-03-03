"use client";

import { UseFormReturn } from "react-hook-form";
import { Info, FileText } from "lucide-react";
import type { InvoiceFormData, InvoiceTotals, LineItemFormData } from "@/lib/validations/invoice";
import { SectionCard } from "./section-card";
import { InvoiceDetailsSection } from "./invoice-details-section";
import { LineItemsSection } from "./line-items-section";
import { TotalsSection } from "./totals-section";
import { NotesSection } from "./notes-section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  rate: string;
}

interface InvoiceFormProps {
  form: UseFormReturn<InvoiceFormData>;
  totals: InvoiceTotals;
  clients: Client[];
  items: Item[];
  onAddLineItem: () => void;
  onRemoveLineItem: (id: string) => void;
  onUpdateLineItem: (id: string, field: keyof LineItemFormData, value: string | number) => void;
  onAddFromLibrary: (item: Item) => void;
  onAddNewClient?: () => void;
  companyName?: string;
  companyAddress?: string;
  onCompanyNameChange?: (value: string) => void;
  onCompanyAddressChange?: (value: string) => void;
}

export function InvoiceForm({
  form,
  totals,
  clients,
  items,
  onAddLineItem,
  onRemoveLineItem,
  onUpdateLineItem,
  onAddFromLibrary,
  onAddNewClient,
  companyName = "",
  companyAddress = "",
  onCompanyNameChange,
  onCompanyAddressChange,
}: InvoiceFormProps) {
  const lineItems = form.watch("lineItems");
  const currency = form.watch("currency");

  return (
    <div className="space-y-4 p-6">
      {/* Invoice Template Selector */}
      <div className="flex items-center justify-between">
        <Label className="text-sm text-foreground">Invoice Template</Label>
        <Select defaultValue="default">
          <SelectTrigger className="w-[160px] bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Select template" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Company Details Section */}
      <SectionCard title="Company Details" defaultOpen={true}>
        {/* Company Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Name</Label>
          <Input
            value={companyName}
            onChange={(e) => onCompanyNameChange?.(e.target.value)}
            placeholder="iforinvoice"
            className="bg-background border border-border rounded-lg h-10 focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Info className="w-3 h-3" />
            Name of your company
          </p>
        </div>

        {/* Company Address */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Address</Label>
          <Textarea
            value={companyAddress}
            onChange={(e) => onCompanyAddressChange?.(e.target.value)}
            placeholder="123 Main St, Anytown, USA"
            className="bg-background border border-border rounded-lg min-h-[80px] resize-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Company Fields - Add New */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Fields</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-border hover:bg-secondary/30 text-muted-foreground"
          >
            Add New Field
          </Button>
        </div>
      </SectionCard>

      {/* Client Details Section */}
      <SectionCard title="Client Details" defaultOpen={true}>
        <InvoiceDetailsSection
          form={form}
          clients={clients}
          onAddNewClient={onAddNewClient}
        />
      </SectionCard>

      {/* Line Items Section */}
      <SectionCard title="Line Items" defaultOpen={true}>
        <LineItemsSection
          lineItems={lineItems}
          currency={currency}
          items={items}
          onAddItem={onAddLineItem}
          onRemoveItem={onRemoveLineItem}
          onUpdateItem={onUpdateLineItem}
          onAddFromLibrary={onAddFromLibrary}
        />
      </SectionCard>

      {/* Tax & Discount Section */}
      <SectionCard title="Tax & Discount" defaultOpen={true}>
        <TotalsSection form={form} totals={totals} currency={currency} />
      </SectionCard>

      {/* Notes & Terms Section */}
      <SectionCard title="Notes & Terms" defaultOpen={false}>
        <NotesSection form={form} />
      </SectionCard>
    </div>
  );
}
