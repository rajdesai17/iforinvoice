"use client";

import { UseFormReturn } from "react-hook-form";
import { ImagePlus, FileSignature, Plus } from "lucide-react";
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
    <div className="space-y-4 p-6 overflow-y-auto h-full">
      {/* Invoice Template Selector */}
      <div className="flex items-center justify-between">
        <Label className="text-sm text-foreground">Invoice Template</Label>
        <Select defaultValue="default">
          <SelectTrigger className="w-[140px] bg-card border-border">
            <SelectValue placeholder="Select template" />
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
        {/* Logo and Signature Uploaders */}
        <div className="grid grid-cols-2 gap-4">
          {/* Company Logo Uploader */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Company Logo</Label>
            <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground">Select Image From Assets</p>
                <p className="text-xs text-muted-foreground">Type: logo</p>
              </div>
            </div>
          </div>

          {/* Company Signature Uploader */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Company Signature</Label>
            <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground">Select Image From Assets</p>
                <p className="text-xs text-muted-foreground">Type: signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Name</Label>
          <Input
            value={companyName}
            onChange={(e) => onCompanyNameChange?.(e.target.value)}
            placeholder="Your Company Name"
            className="bg-card border-border"
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full border border-muted-foreground flex items-center justify-center text-[8px]">i</span>
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
            className="bg-card border-border min-h-[80px] resize-none"
          />
        </div>

        {/* Company Fields - Add New */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Company Fields</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed border-border hover:bg-secondary/50"
          >
            <Plus className="w-4 h-4 mr-2" />
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
