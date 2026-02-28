"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

import { useInvoiceForm } from "@/hooks/use-invoice-form";
import { useInvoiceCalculations } from "@/hooks/use-invoice-calculations";
import { useKeyboardShortcuts, INVOICE_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { InvoiceFormData, LineItemFormData } from "@/lib/validations/invoice";

import { InvoiceActionsBar } from "./invoice-actions-bar";
import { InvoiceForm } from "./invoice-form";
import { InvoiceLivePreview } from "./invoice-live-preview";
import { createInvoice, saveDraft } from "@/app/(dashboard)/invoices/actions";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  rate: string;
}

interface BusinessProfile {
  businessName: string | null;
  email: string | null;
  phone?: string | null;
  addressLine1: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  logoUrl?: string | null;
  defaultCurrency?: string | null;
  defaultPaymentTerms?: number | null;
  invoiceNotes?: string | null;
  invoiceFooter?: string | null;
}

interface InvoicePageLayoutProps {
  clients: Client[];
  items: Item[];
  defaultInvoiceNumber: string;
  defaultPaymentTerms: number;
  businessProfile: BusinessProfile | null;
}

export function InvoicePageLayout({
  clients,
  items,
  defaultInvoiceNumber,
  defaultPaymentTerms,
  businessProfile,
}: InvoicePageLayoutProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    form,
    lineItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    addFromLibrary,
  } = useInvoiceForm({
    invoiceNumber: defaultInvoiceNumber,
    defaultCurrency: businessProfile?.defaultCurrency || "USD",
    defaultPaymentTerms: defaultPaymentTerms,
    defaultNotes: businessProfile?.invoiceNotes || "",
    defaultTerms: businessProfile?.invoiceFooter || "",
  });

  const formValues = form.watch();
  const totals = useInvoiceCalculations({
    lineItems,
    taxRate: formValues.taxRate,
    discountType: formValues.discountType,
    discountValue: formValues.discountValue,
  });

  const selectedClient = clients.find((c) => c.id === formValues.clientId);

  // Auto-save draft functionality
  const handleAutoSave = useCallback(async (data: InvoiceFormData) => {
    if (!data.clientId) return; // Don't save without a client
    try {
      await saveDraft({
        ...data,
        ...totals,
        issueDate: data.issueDate.toISOString(),
        dueDate: data.dueDate.toISOString(),
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
      throw error;
    }
  }, [totals]);

  const { status: autoSaveStatus, saveNow } = useAutoSave({
    data: formValues,
    onSave: handleAutoSave,
    debounceMs: 3000,
    enabled: !!formValues.clientId,
  });

  // Form submission handlers
  const handleSaveDraft = async () => {
    if (!formValues.clientId) {
      toast.error("Please select a client");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createInvoice({
        invoiceNumber: formValues.invoiceNumber,
        clientId: formValues.clientId,
        issueDate: formValues.issueDate.toISOString(),
        dueDate: formValues.dueDate.toISOString(),
        status: "draft",
        lineItems: formValues.lineItems.filter((item) => item.description && item.amount > 0),
        taxRate: formValues.taxRate,
        discountType: formValues.discountType,
        discountValue: formValues.discountValue,
        notes: formValues.notes || "",
        terms: formValues.terms || "",
        currency: formValues.currency,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
      });

      if (result.success) {
        toast.success("Invoice saved as draft");
        router.push(`/invoices/${result.invoice?.id}`);
      } else {
        toast.error(result.error || "Failed to save invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndSend = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formValues.lineItems.every((item) => !item.description || item.amount === 0)) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createInvoice({
        invoiceNumber: formValues.invoiceNumber,
        clientId: formValues.clientId,
        issueDate: formValues.issueDate.toISOString(),
        dueDate: formValues.dueDate.toISOString(),
        status: "sent",
        lineItems: formValues.lineItems.filter((item) => item.description && item.amount > 0),
        taxRate: formValues.taxRate,
        discountType: formValues.discountType,
        discountValue: formValues.discountValue,
        notes: formValues.notes || "",
        terms: formValues.terms || "",
        currency: formValues.currency,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        total: totals.total,
      });

      if (result.success) {
        toast.success("Invoice created and ready to send");
        router.push(`/invoices/${result.invoice?.id}`);
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const previewElement = document.getElementById("invoice-preview");
    if (!previewElement) {
      toast.error("Preview not available");
      return;
    }

    try {
      toast.loading("Generating PDF...");
      const canvas = await html2canvas(previewElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${formValues.invoiceNumber}.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      { ...INVOICE_SHORTCUTS.save, action: handleSaveDraft },
      { ...INVOICE_SHORTCUTS.send, action: handleSaveAndSend },
      { ...INVOICE_SHORTCUTS.addItem, action: addLineItem },
    ],
  });

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <InvoiceActionsBar
        onSaveDraft={handleSaveDraft}
        onSaveAndSend={handleSaveAndSend}
        onDownloadPdf={handleDownloadPdf}
        isSubmitting={isSubmitting}
        autoSaveStatus={autoSaveStatus}
        isDirty={form.formState.isDirty}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Form Panel - Fixed width */}
        <div className="w-[600px] flex-shrink-0 border-r border-border">
          <InvoiceForm
            form={form}
            totals={totals}
            clients={clients}
            items={items}
            onAddLineItem={addLineItem}
            onRemoveLineItem={removeLineItem}
            onUpdateLineItem={updateLineItem}
            onAddFromLibrary={addFromLibrary}
          />
        </div>

        {/* Preview Panel - Takes remaining space */}
        <div
          ref={previewRef}
          className="flex-1 p-8 overflow-auto bg-muted/30 flex items-start justify-center"
        >
          <div className="w-full max-w-md sticky top-0">
            <InvoiceLivePreview
              formData={formValues}
              totals={totals}
              client={selectedClient}
              businessProfile={businessProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
