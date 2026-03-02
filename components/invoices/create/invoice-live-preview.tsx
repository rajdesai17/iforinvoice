"use client";

import { format } from "date-fns";
import { formatCurrency } from "@/lib/currencies";
import type { InvoiceFormData, InvoiceTotals } from "@/lib/validations/invoice";

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
}

interface InvoiceLivePreviewProps {
  formData: InvoiceFormData;
  totals: InvoiceTotals;
  client?: Client;
  businessProfile: BusinessProfile | null;
  companyName?: string;
  companyAddress?: string;
}

export function InvoiceLivePreview({
  formData,
  totals,
  client,
  businessProfile,
  companyName,
  companyAddress,
}: InvoiceLivePreviewProps) {
  const validLineItems = formData.lineItems.filter(
    (item) => item.description && item.amount > 0
  );
  const currency = formData.currency;
  
  // Use local company name/address or fall back to business profile
  const displayCompanyName = companyName || businessProfile?.businessName || "iforinvoice";
  const displayCompanyAddress = companyAddress || 
    [businessProfile?.addressLine1, businessProfile?.city, businessProfile?.state, businessProfile?.postalCode]
      .filter(Boolean)
      .join(", ") || "123 Main St, Anytown, USA";

  // A4 dimensions: 210mm x 297mm, scaled down to fit
  const a4Width = 794; // px at 96dpi
  const a4Height = 1123; // px at 96dpi
  const scale = 0.52; // Scale to ~413px width to fit panel

  return (
    // Wrapper to handle the scaled element's visual space
    <div 
      className="flex items-start justify-center w-full"
      style={{
        height: a4Height * scale,
        minHeight: a4Height * scale,
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        id="invoice-preview"
        style={{
          width: a4Width,
          minHeight: a4Height,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        <div className="flex flex-col p-12">
        {/* Header - Invoice Title with Number */}
        <div className="flex-shrink-0 mb-8">
          <h1 className="text-4xl font-semibold text-primary font-mono tracking-tight">
            Invoice {formData.invoiceNumber}
          </h1>
        </div>

        {/* Metadata Grid - Serial Number, Date, Currency */}
        <div className="flex-shrink-0 flex gap-12 text-base mb-10">
          <div>
            <p className="text-gray-400 mb-1">Serial Number</p>
            <p className="text-gray-700 font-medium text-lg">{formData.invoiceNumber.replace("INV-", "")}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Date</p>
            <p className="text-gray-700 font-medium text-lg">{format(formData.issueDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Currency</p>
            <p className="text-gray-700 font-medium text-lg">{currency}</p>
          </div>
        </div>

        {/* Billing Cards - Side by Side */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-6 mb-10">
          {/* Billed By Card */}
          <div className="bg-gray-50/80 rounded-xl p-6 border border-gray-100">
            <h3 className="text-primary font-medium text-base mb-2">Billed By</h3>
            <p className="font-semibold text-gray-900 text-lg">{displayCompanyName}</p>
            {displayCompanyAddress && (
              <p className="text-gray-500 text-base mt-2 leading-relaxed">{displayCompanyAddress}</p>
            )}
          </div>

          {/* Billed To Card */}
          <div className="bg-gray-50/80 rounded-xl p-6 border border-gray-100">
            <h3 className="text-primary font-medium text-base mb-2">Billed To</h3>
            {client ? (
              <>
                <p className="font-semibold text-gray-900 text-lg">
                  {client.company || client.name}
                </p>
                {(client.addressLine1 || client.city) && (
                  <p className="text-gray-500 text-base mt-2 leading-relaxed">
                    {[client.addressLine1, client.city, client.state, client.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-lg">Select a client</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200">
          {/* Table Header - Purple */}
          <div className="flex-shrink-0 bg-primary text-white text-base font-semibold">
            <div className="grid grid-cols-12 gap-4 px-6 py-4">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="bg-white min-h-[200px]">
            {validLineItems.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {validLineItems.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 text-base"
                  >
                    <div className="col-span-5 text-gray-900 truncate">
                      {item.description}
                    </div>
                    <div className="col-span-2 text-center text-gray-600">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-gray-600">
                      {formatCurrency(item.unitPrice, currency)}
                    </div>
                    <div className="col-span-3 text-right text-gray-900 font-medium">
                      {formatCurrency(item.amount, currency)}
                    </div>
                  </div>
                ))}
                {validLineItems.length > 10 && (
                  <div className="px-6 py-4 text-base text-gray-400 text-center">
                    +{validLineItems.length - 10} more items
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-lg py-16">
                No line items added yet
              </div>
            )}
          </div>
        </div>

        {/* Totals - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-end mt-8">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-base">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(totals.subtotal, currency)}
              </span>
            </div>
            {formData.taxRate > 0 && (
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Tax ({formData.taxRate}%)</span>
                <span className="text-gray-900">
                  {formatCurrency(totals.taxAmount, currency)}
                </span>
              </div>
            )}
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-base">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">
                  -{formatCurrency(totals.discountAmount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xl font-semibold pt-4 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-primary">
                {formatCurrency(totals.total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
