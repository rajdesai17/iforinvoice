"use client";

import { format } from "date-fns";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

interface BusinessProfile {
  businessName: string | null;
  email: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  client?: Client;
  businessProfile: BusinessProfile | null;
  issueDate: Date;
  dueDate: Date;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function InvoicePreview({
  invoiceNumber,
  client,
  businessProfile,
  issueDate,
  dueDate,
  lineItems,
  subtotal,
  taxRate,
  taxAmount,
  discountAmount,
  total,
  notes,
}: InvoicePreviewProps) {
  const validLineItems = lineItems.filter((item) => item.description && item.amount > 0);

  return (
    <div className="invoice-paper overflow-hidden min-h-[842px] flex flex-col" style={{
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    }}>
      <div className="p-8 bg-white text-[#111113] flex-1">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-mono font-semibold text-primary tracking-wider uppercase">
                Invoice
              </h2>
              <p className="text-2xl font-mono font-bold text-primary mt-1">{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-[#111113]">{businessProfile?.businessName || "Your Business"}</p>
              {businessProfile?.email && (
                <p className="text-sm text-[#6b7280]">{businessProfile.email}</p>
              )}
              {businessProfile?.addressLine1 && (
                <p className="text-sm text-[#6b7280]">{businessProfile.addressLine1}</p>
              )}
              {(businessProfile?.city || businessProfile?.state) && (
                <p className="text-sm text-[#6b7280]">
                  {[businessProfile?.city, businessProfile?.state, businessProfile?.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#e5e7eb]">
            <div>
              <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Bill To</p>
              {client ? (
                <>
                  <p className="font-medium text-[#111113]">{client.company || client.name}</p>
                  {client.company && <p className="text-sm text-[#6b7280]">{client.name}</p>}
                  {client.email && (
                    <p className="text-sm text-[#6b7280]">{client.email}</p>
                  )}
                </>
              ) : (
                <p className="text-[#9ca3af] italic text-sm">Select a client</p>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Issue Date:</span>
                  <span className="text-[#111113]">{format(issueDate, "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Due Date:</span>
                  <span className="text-[#111113]">{format(dueDate, "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden border border-[#e5e7eb]">
            {/* Header Row - Violet Background */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-primary text-white text-xs font-semibold uppercase tracking-wider">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            {/* Content Rows */}
            <div className="divide-y divide-[#e5e7eb]">
              {validLineItems.length > 0 ? (
                validLineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                    <div className="col-span-6 truncate text-[#111113]">{item.description}</div>
                    <div className="col-span-2 text-right text-[#6b7280]">{item.quantity}</div>
                    <div className="col-span-2 text-right text-[#6b7280]">{formatCurrency(item.unitPrice)}</div>
                    <div className="col-span-2 text-right text-[#111113] font-medium">{formatCurrency(item.amount)}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[#9ca3af] text-sm">
                  No line items added
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#9ca3af]">Subtotal</span>
                <span className="text-[#111113]">{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Tax ({taxRate}%)</span>
                  <span className="text-[#111113]">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#9ca3af]">Discount</span>
                  <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-[#e5e7eb]">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-[#111113]">Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="pt-4 border-t border-[#e5e7eb]">
              <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-[#6b7280] whitespace-pre-wrap">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
