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
  const displayCompanyName = companyName || businessProfile?.businessName || "Your Company";
  const displayCompanyAddress = companyAddress || 
    [businessProfile?.addressLine1, businessProfile?.city, businessProfile?.state, businessProfile?.postalCode]
      .filter(Boolean)
      .join(", ") || "";

  return (
    // Fixed A4 paper size container (scaled down to fit viewport)
    // A4 aspect ratio is 1:1.414 (210mm x 297mm)
    // Using 380px width = 537px height for proper A4 ratio
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden flex-shrink-0"
      style={{
        width: "380px",
        height: "537px", // A4 aspect ratio: 380 * 1.414
      }}
      id="invoice-preview"
    >
      <div className="h-full flex flex-col p-5 overflow-hidden">
        {/* Header - Invoice Title with Number */}
        <div className="flex-shrink-0 mb-3">
          <h1 className="text-xl font-semibold text-primary font-mono">
            Invoice {formData.invoiceNumber}
          </h1>
        </div>

        {/* Metadata Grid - Serial Number, Date, Currency */}
        <div className="flex-shrink-0 grid grid-cols-3 gap-3 text-xs mb-4">
          <div>
            <p className="text-gray-400">Serial Number</p>
            <p className="text-gray-600">{formData.invoiceNumber.replace("INV-", "")}</p>
          </div>
          <div>
            <p className="text-gray-400">Date</p>
            <p className="text-gray-600">{format(formData.issueDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-gray-400">Currency</p>
            <p className="text-gray-600">{currency}</p>
          </div>
        </div>

        {/* Billing Cards - Side by Side */}
        <div className="flex-shrink-0 grid grid-cols-2 gap-3 mb-4">
          {/* Billed By Card */}
          <div className="bg-gray-50 rounded-md p-3">
            <h3 className="text-primary font-medium text-xs mb-1">Billed By</h3>
            <p className="font-semibold text-gray-900 text-xs">{displayCompanyName}</p>
            {displayCompanyAddress && (
              <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-2">{displayCompanyAddress}</p>
            )}
          </div>

          {/* Billed To Card */}
          <div className="bg-gray-50 rounded-md p-3">
            <h3 className="text-primary font-medium text-xs mb-1">Billed To</h3>
            {client ? (
              <>
                <p className="font-semibold text-gray-900 text-xs">
                  {client.company || client.name}
                </p>
                {(client.addressLine1 || client.city) && (
                  <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-2">
                    {[client.addressLine1, client.city, client.state, client.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-xs italic">Select a client</p>
            )}
          </div>
        </div>

        {/* Line Items Table - Takes remaining space */}
        <div className="flex-1 flex flex-col min-h-0 rounded-md overflow-hidden border border-gray-200">
          {/* Table Header - Purple */}
          <div className="flex-shrink-0 bg-primary text-white text-[10px] font-semibold">
            <div className="grid grid-cols-12 gap-1 px-3 py-2">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
          </div>

          {/* Table Body - Scrollable if needed */}
          <div className="flex-1 overflow-y-auto bg-white">
            {validLineItems.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {validLineItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-1 px-3 py-2 text-[10px]"
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
                {validLineItems.length > 5 && (
                  <div className="px-3 py-1 text-[10px] text-gray-400 text-center">
                    +{validLineItems.length - 5} more items
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No line items added yet
              </div>
            )}
          </div>
        </div>

        {/* Totals - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-end mt-3">
          <div className="w-36 space-y-1">
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
            <div className="flex justify-between text-xs font-semibold pt-1 border-t border-gray-200">
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
