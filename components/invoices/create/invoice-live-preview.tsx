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
}

export function InvoiceLivePreview({
  formData,
  totals,
  client,
  businessProfile,
}: InvoiceLivePreviewProps) {
  const validLineItems = formData.lineItems.filter(
    (item) => item.description && item.amount > 0
  );
  const currency = formData.currency;

  return (
    <div className="invoice-paper rounded-lg overflow-hidden" id="invoice-preview">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {businessProfile?.logoUrl ? (
              <img 
                src={businessProfile.logoUrl} 
                alt="Logo" 
                className="h-10 w-auto mb-2"
                crossOrigin="anonymous"
              />
            ) : null}
            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-sm font-mono text-primary font-semibold">
              {formData.invoiceNumber}
            </p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="font-semibold text-gray-900">
              {businessProfile?.businessName || "Your Business"}
            </p>
            {businessProfile?.addressLine1 && (
              <p className="text-xs text-gray-500">{businessProfile.addressLine1}</p>
            )}
            {(businessProfile?.city || businessProfile?.state) && (
              <p className="text-xs text-gray-500">
                {[businessProfile.city, businessProfile.state, businessProfile.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {businessProfile?.email && (
              <p className="text-xs text-gray-500">{businessProfile.email}</p>
            )}
            {businessProfile?.phone && (
              <p className="text-xs text-gray-500">{businessProfile.phone}</p>
            )}
          </div>
        </div>

        {/* Bill To & Dates */}
        <div className="flex justify-between items-start pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Bill To
            </p>
            {client ? (
              <div className="space-y-0.5">
                <p className="font-medium text-gray-900">
                  {client.company || client.name}
                </p>
                {client.company && client.name && (
                  <p className="text-sm text-gray-500">{client.name}</p>
                )}
                {client.addressLine1 && (
                  <p className="text-sm text-gray-500">{client.addressLine1}</p>
                )}
                {(client.city || client.state) && (
                  <p className="text-sm text-gray-500">
                    {[client.city, client.state, client.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {client.email && (
                  <p className="text-sm text-gray-500">{client.email}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Select a client</p>
            )}
          </div>
          <div className="text-right space-y-2">
            <div>
              <p className="text-xs text-gray-400">Issue Date</p>
              <p className="text-sm font-medium text-gray-900">
                {format(formData.issueDate, "MMMM d, yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Due Date</p>
              <p className="text-sm font-medium text-gray-900">
                {format(formData.dueDate, "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-primary text-white text-xs font-semibold uppercase tracking-wider">
            <div className="grid grid-cols-12 gap-2 px-4 py-3">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {validLineItems.length > 0 ? (
              validLineItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm ${
                    index % 2 === 1 ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="col-span-5 text-gray-900 truncate">
                    {item.description}
                  </div>
                  <div className="col-span-2 text-right text-gray-600 font-mono">
                    {item.quantity}
                  </div>
                  <div className="col-span-2 text-right text-gray-600 font-mono">
                    {formatCurrency(item.unitPrice, currency)}
                  </div>
                  <div className="col-span-3 text-right text-gray-900 font-mono font-medium">
                    {formatCurrency(item.amount, currency)}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No line items added yet
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-mono">
                {formatCurrency(totals.subtotal, currency)}
              </span>
            </div>
            {formData.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax ({formData.taxRate}%)</span>
                <span className="text-gray-900 font-mono">
                  {formatCurrency(totals.taxAmount, currency)}
                </span>
              </div>
            )}
            {totals.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Discount
                  {formData.discountType === "percentage"
                    ? ` (${formData.discountValue}%)`
                    : ""}
                </span>
                <span className="text-green-600 font-mono">
                  -{formatCurrency(totals.discountAmount, currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total</span>
              <span className="text-primary font-mono">
                {formatCurrency(totals.total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(formData.notes || formData.terms) && (
          <div className="pt-4 border-t border-gray-200 space-y-4">
            {formData.notes && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {formData.notes}
                </p>
              </div>
            )}
            {formData.terms && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Terms & Conditions
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
