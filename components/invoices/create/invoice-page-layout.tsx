"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import type { ImperativePanelHandle } from "react-resizable-panels";

import { useInvoiceForm } from "@/hooks/use-invoice-form";
import { useInvoiceCalculations } from "@/hooks/use-invoice-calculations";
import { useKeyboardShortcuts, INVOICE_SHORTCUTS } from "@/hooks/use-keyboard-shortcuts";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useIsMobile } from "@/hooks/use-mobile";
import type { InvoiceFormData } from "@/lib/validations/invoice";

import { InvoiceActionsBar } from "./invoice-actions-bar";
import { InvoiceForm } from "./invoice-form";
import { InvoiceLivePreview } from "./invoice-live-preview";
import { createInvoice, saveDraft } from "@/app/(dashboard)/invoices/actions";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

type ViewMode = "both" | "form" | "preview";

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
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const previewRef = useRef<HTMLDivElement>(null);
  const formPanelRef = useRef<ImperativePanelHandle>(null);
  const previewPanelRef = useRef<ImperativePanelHandle>(null);
  const isMobile = useIsMobile();
  
  // Local company details (can override business profile)
  const [companyName, setCompanyName] = useState(businessProfile?.businessName || "");
  const [companyAddress, setCompanyAddress] = useState(
    [businessProfile?.addressLine1, businessProfile?.city, businessProfile?.state, businessProfile?.postalCode]
      .filter(Boolean)
      .join(", ") || ""
  );

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
    if (!data.clientId) return;
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

  const { status: autoSaveStatus } = useAutoSave({
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
    // Ensure preview panel is visible for capture
    const wasCollapsed = previewPanelRef.current?.isCollapsed();
    if (wasCollapsed) {
      previewPanelRef.current?.expand();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const previewElement = document.getElementById("invoice-preview");
    if (!previewElement) {
      toast.error("Preview not available");
      if (wasCollapsed) previewPanelRef.current?.collapse();
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
    } finally {
      if (wasCollapsed) previewPanelRef.current?.collapse();
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

  // Sync resizable panels with viewMode
  useEffect(() => {
    const formPanel = formPanelRef.current;
    const previewPanel = previewPanelRef.current;
    if (!formPanel || !previewPanel) return;

    if (isMobile && viewMode === "both") {
      setViewMode("form");
      return;
    }

    switch (viewMode) {
      case "form":
        if (formPanel.isCollapsed()) formPanel.expand();
        previewPanel.collapse();
        break;
      case "preview":
        if (previewPanel.isCollapsed()) previewPanel.expand();
        formPanel.collapse();
        break;
      case "both":
        if (formPanel.isCollapsed()) formPanel.expand();
        if (previewPanel.isCollapsed()) previewPanel.expand();
        formPanel.resize(50);
        previewPanel.resize(50);
        break;
    }
  }, [viewMode, isMobile]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <InvoiceActionsBar
        onSaveDraft={handleSaveDraft}
        onSaveAndSend={handleSaveAndSend}
        onDownloadPdf={handleDownloadPdf}
        isSubmitting={isSubmitting}
        autoSaveStatus={autoSaveStatus}
        isDirty={form.formState.isDirty}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Form Panel */}
        <ResizablePanel
          ref={formPanelRef}
          collapsible
          defaultSize={50}
          minSize={30}
        >
          <div className="h-full overflow-y-auto bg-background">
            <InvoiceForm
              form={form}
              totals={totals}
              clients={clients}
              items={items}
              onAddLineItem={addLineItem}
              onRemoveLineItem={removeLineItem}
              onUpdateLineItem={updateLineItem}
              onAddFromLibrary={addFromLibrary}
              companyName={companyName}
              companyAddress={companyAddress}
              onCompanyNameChange={setCompanyName}
              onCompanyAddressChange={setCompanyAddress}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Preview Panel */}
        <ResizablePanel
          ref={previewPanelRef}
          collapsible
          defaultSize={40}
          minSize={25}
          maxSize={45}
        >
          <div
            ref={previewRef}
            className="h-full overflow-y-auto bg-sidebar flex items-start justify-center p-4"
          >
            <InvoiceLivePreview
              formData={formValues}
              totals={totals}
              client={selectedClient}
              businessProfile={businessProfile}
              companyName={companyName}
              companyAddress={companyAddress}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
