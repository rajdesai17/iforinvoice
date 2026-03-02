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
    <div className="invoice-paper rounded-lg overflow-hidden" id="invoice-preview">
      <div className="p-6 space-y-5">
        {/* Header - Invoice Title with Number */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primary font-mono">
            Invoice {formData.invoiceNumber}
          </h1>
        </div>

        {/* Metadata Grid - Serial Number, Date, Currency */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Serial Number</p>
            <p className="text-gray-600">{formData.invoiceNumber.replace("INV-", "")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Date</p>
            <p className="text-gray-600">{format(formData.issueDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Currency</p>
            <p className="text-gray-600">{currency}</p>
          </div>
        </div>

        {/* Billing Cards - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Billed By Card */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-primary font-medium text-sm mb-2">Billed By</h3>
            <p className="font-semibold text-gray-900 text-sm">{displayCompanyName}</p>
            {displayCompanyAddress && (
              <p className="text-gray-500 text-xs mt-1">{displayCompanyAddress}</p>
            )}
          </div>

          {/* Billed To Card */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="text-primary font-medium text-sm mb-2">Billed To</h3>
            {client ? (
              <>
                <p className="font-semibold text-gray-900 text-sm">
                  {client.company || client.name}
                </p>
                {(client.addressLine1 || client.city) && (
                  <p className="text-gray-500 text-xs mt-1">
                    {[client.addressLine1, client.city, client.state, client.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm italic">Select a client</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-lg overflow-hidden border border-gray-200">
          {/* Table Header - Purple */}
          <div className="bg-primary text-white text-xs font-semibold">
            <div className="grid grid-cols-12 gap-2 px-4 py-3">
              <div className="col-span-5">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Total</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100 bg-white">
            {validLineItems.length > 0 ? (
              validLineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm"
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
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">
                No line items added yet
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-48 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">
                {formatCurrency(totals.subtotal, currency)}
              </span>
            </div>
            {formData.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({formData.taxRate}%)</span>
                <span className="text-gray-900">
                  {formatCurrency(totals.taxAmount, currency)}
                </span>
              </div>
            )}
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600">
                  -{formatCurrency(totals.discountAmount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-primary">
                {formatCurrency(totals.total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(formData.notes || formData.terms) && (
          <div className="pt-4 border-t border-gray-200 space-y-3">
            {formData.notes && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {formData.notes}
                </p>
              </div>
            )}
            {formData.terms && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Terms
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {formData.terms}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
