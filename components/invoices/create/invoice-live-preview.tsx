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

  // A4 aspect ratio: 210mm x 297mm = 1:1.414
  return (
    <div 
      className="bg-white overflow-hidden w-full h-full"
      id="invoice-preview"
    >
      <div className="flex flex-col p-5 h-full">
        {/* Header - Invoice Title with Number */}
        <div className="shrink-0 mb-3">
          <h1 className="text-xl font-semibold text-primary font-mono tracking-tight">
            Invoice {formData.invoiceNumber}
          </h1>
        </div>

        {/* Metadata Grid - Serial Number, Date, Currency */}
        <div className="shrink-0 flex gap-6 text-[10px] mb-4">
          <div>
            <p className="text-gray-400 mb-0.5">Serial Number</p>
            <p className="text-gray-700 font-medium">{formData.invoiceNumber.replace("INV-", "")}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Date</p>
            <p className="text-gray-700 font-medium">{format(formData.issueDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Currency</p>
            <p className="text-gray-700 font-medium">{currency}</p>
          </div>
        </div>

        {/* Billing Cards - Side by Side */}
        <div className="shrink-0 grid grid-cols-2 gap-3 mb-4">
          {/* Billed By Card */}
          <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
            <h3 className="text-primary font-medium text-[10px] mb-1">Billed By</h3>
            <p className="font-semibold text-gray-900 text-xs">{displayCompanyName}</p>
            {displayCompanyAddress && (
              <p className="text-gray-500 text-[10px] mt-1 leading-relaxed">{displayCompanyAddress}</p>
            )}
          </div>

          {/* Billed To Card */}
          <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
            <h3 className="text-primary font-medium text-[10px] mb-1">Billed To</h3>
            {client ? (
              <>
                <p className="font-semibold text-gray-900 text-xs">
                  {client.company || client.name}
                </p>
                {(client.addressLine1 || client.city) && (
                  <p className="text-gray-500 text-[10px] mt-1 leading-relaxed">
                    {[client.addressLine1, client.city, client.state, client.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-xs">Select a client</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="flex flex-col flex-1 rounded-lg overflow-hidden border border-gray-200">
          {/* Table Header - Purple */}
          <div className="shrink-0 bg-primary text-white text-[10px] font-semibold">
            <div className="grid grid-cols-12 gap-2 px-3 py-2">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="bg-white flex-1 min-h-[60px]">
            {validLineItems.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {validLineItems.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px]"
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
                {validLineItems.length > 6 && (
                  <div className="px-3 py-2 text-[10px] text-gray-400 text-center">
                    +{validLineItems.length - 6} more items
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs py-6">
                No line items added yet
              </div>
            )}
          </div>
        </div>

        {/* Totals - Fixed at bottom */}
        <div className="shrink-0 flex justify-end mt-3">
          <div className="w-40 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(totals.subtotal, currency)}
              </span>
            </div>
            {formData.taxRate > 0 && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Tax ({formData.taxRate}%)</span>
                <span className="text-gray-900">
                  {formatCurrency(totals.taxAmount, currency)}
                </span>
              </div>
            )}
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">
                  -{formatCurrency(totals.discountAmount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-primary">
                {formatCurrency(totals.total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
