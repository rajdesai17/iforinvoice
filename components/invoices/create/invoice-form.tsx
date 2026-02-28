"use client";

import { UseFormReturn } from "react-hook-form";
import type { InvoiceFormData, InvoiceTotals, LineItemFormData } from "@/lib/validations/invoice";
import { SectionCard } from "./section-card";
import { InvoiceDetailsSection } from "./invoice-details-section";
import { LineItemsSection } from "./line-items-section";
import { TotalsSection } from "./totals-section";
import { NotesSection } from "./notes-section";

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
}: InvoiceFormProps) {
  const lineItems = form.watch("lineItems");
  const currency = form.watch("currency");

  return (
    <div className="space-y-4 p-6 overflow-y-auto h-full">
      <SectionCard title="Invoice Details">
        <InvoiceDetailsSection
          form={form}
          clients={clients}
          onAddNewClient={onAddNewClient}
        />
      </SectionCard>

      <SectionCard title="Line Items">
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

      <SectionCard title="Tax & Discount">
        <TotalsSection form={form} totals={totals} currency={currency} />
      </SectionCard>

      <SectionCard title="Notes & Terms" defaultOpen={false}>
        <NotesSection form={form} />
      </SectionCard>
    </div>
  );
}
