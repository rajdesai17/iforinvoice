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
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-semibold text-[#71717A] uppercase tracking-wide">Invoice</p>
            <p className="text-xl font-bold text-[#09090B] font-mono">{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm text-[#09090B]">
              {businessProfile?.businessName || "My Business"}
            </p>
            <p className="text-xs text-[#71717A]">
              {businessProfile?.email || "demo@example.com"}
            </p>
          </div>
        </div>

        {/* Bill To + Dates Row */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">
              Bill To
            </p>
            {client ? (
              <p className="text-sm text-[#3F3F46]">{client.company || client.name}</p>
            ) : (
              <p className="text-sm text-[#A1A1AA] italic">Select a client</p>
            )}
          </div>
          <div className="text-right space-y-0.5">
            <div className="flex justify-end gap-2 text-xs">
              <span className="text-[#A1A1AA]">Issue Date:</span>
              <span className="text-[#09090B] font-medium">{format(issueDate, "MMM d, yyyy")}</span>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <span className="text-[#A1A1AA]">Due Date:</span>
              <span className="text-[#09090B] font-medium">{format(dueDate, "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-[#E4E4E7] rounded overflow-hidden mb-4">
          {/* Table Header */}
          <div className="bg-[#18181B] text-[#FAFAFA] text-[10px] font-semibold uppercase tracking-wider">
            <div className="flex px-3 py-2">
              <div className="flex-1">Description</div>
              <div className="w-12 text-right">Qty</div>
              <div className="w-16 text-right">Price</div>
              <div className="w-20 text-right">Amount</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="divide-y divide-[#E4E4E7]">
            {validLineItems.length > 0 ? (
              validLineItems.map((item) => (
                <div key={item.id} className="flex px-3 py-2 text-xs">
                  <div className="flex-1 text-[#09090B] truncate">{item.description}</div>
                  <div className="w-12 text-right text-[#71717A]">{item.quantity}</div>
                  <div className="w-16 text-right text-[#71717A]">{formatCurrency(item.unitPrice)}</div>
                  <div className="w-20 text-right text-[#09090B] font-medium">{formatCurrency(item.amount)}</div>
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-center text-[#A1A1AA] text-xs">
                No line items added
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#71717A]">Subtotal</span>
              <span className="text-[#09090B]">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[#71717A]">Tax ({taxRate}%)</span>
                <span className="text-[#09090B]">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-[#71717A]">Discount</span>
                <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold pt-1 border-t border-[#E4E4E7]">
              <span className="text-[#09090B]">Total</span>
              <span className="text-[#6366F1]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-4 pt-3 border-t border-[#E4E4E7]">
            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1">Notes</p>
            <p className="text-xs text-[#71717A] whitespace-pre-wrap">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
