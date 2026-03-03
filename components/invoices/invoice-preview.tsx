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
    <div className="bg-white overflow-hidden w-full h-full">
      <div className="p-4 h-full flex flex-col text-[10px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-[8px] font-semibold text-[#71717A] uppercase tracking-wide">Invoice</p>
            <p className="text-sm font-bold text-[#F97316] font-mono">{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-[9px] text-[#09090B]">
              {businessProfile?.businessName || "My Business"}
            </p>
            <p className="text-[8px] text-[#71717A]">
              {businessProfile?.email || "demo@example.com"}
            </p>
          </div>
        </div>

        {/* Meta Row */}
        <div className="grid grid-cols-4 gap-2 mb-2 pb-2 border-b border-[#E4E4E7]">
          <div>
            <p className="text-[7px] text-[#A1A1AA] uppercase">Serial Number</p>
            <p className="text-[#09090B] font-medium">{invoiceNumber.replace("INV-", "")}</p>
          </div>
          <div>
            <p className="text-[7px] text-[#A1A1AA] uppercase">Date</p>
            <p className="text-[#09090B] font-medium">{format(issueDate, "dd/MM/yyyy")}</p>
          </div>
          <div>
            <p className="text-[7px] text-[#A1A1AA] uppercase">Currency</p>
            <p className="text-[#09090B] font-medium">USD</p>
          </div>
          <div>
            <p className="text-[7px] text-[#A1A1AA] uppercase">Due Date</p>
            <p className="text-[#09090B] font-medium">{format(dueDate, "dd/MM/yyyy")}</p>
          </div>
        </div>

        {/* Billed By / Billed To */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-[#FAFAFA] rounded p-2">
            <p className="text-[7px] text-[#F97316] uppercase font-semibold mb-0.5">Billed By</p>
            <p className="text-[#09090B] font-medium">{businessProfile?.businessName || "My Business"}</p>
            <p className="text-[#71717A] text-[8px]">
              {businessProfile?.addressLine1 || "123 Main St, Anytown, USA"}
            </p>
          </div>
          <div className="bg-[#FAFAFA] rounded p-2">
            <p className="text-[7px] text-[#F97316] uppercase font-semibold mb-0.5">Billed To</p>
            {client ? (
              <>
                <p className="text-[#09090B] font-medium">{client.company || client.name}</p>
                <p className="text-[#71717A] text-[8px]">{client.email || ""}</p>
              </>
            ) : (
              <p className="text-[#A1A1AA] italic">Select a client</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-[#E4E4E7] rounded overflow-hidden flex-1 flex flex-col min-h-0 mb-2">
          {/* Table Header */}
          <div className="bg-[#F97316] text-white text-[8px] font-semibold uppercase tracking-wider flex-shrink-0">
            <div className="flex px-2 py-1.5">
              <div className="flex-1">Item</div>
              <div className="w-8 text-right">Qty</div>
              <div className="w-12 text-right">Price</div>
              <div className="w-14 text-right">Total</div>
            </div>
          </div>
          {/* Table Body */}
          <div className="flex-1 overflow-y-auto min-h-[40px]">
            {validLineItems.length > 0 ? (
              validLineItems.slice(0, 4).map((item) => (
                <div key={item.id} className="flex px-2 py-1 border-b border-[#E4E4E7] last:border-b-0">
                  <div className="flex-1 text-[#09090B] truncate">{item.description}</div>
                  <div className="w-8 text-right text-[#71717A]">{item.quantity}</div>
                  <div className="w-12 text-right text-[#71717A]">{formatCurrency(item.unitPrice)}</div>
                  <div className="w-14 text-right text-[#09090B] font-medium">{formatCurrency(item.amount)}</div>
                </div>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-[#A1A1AA]">
                No line items added yet
              </div>
            )}
          </div>
        </div>

        {/* Totals - pushed to bottom */}
        <div className="flex justify-end mt-auto">
          <div className="w-28 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-[#71717A]">Subtotal</span>
              <span className="text-[#09090B]">{formatCurrency(subtotal)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between">
                <span className="text-[#71717A]">Tax ({taxRate}%)</span>
                <span className="text-[#09090B]">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#71717A]">Discount</span>
                <span className="text-red-500">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[10px] font-semibold pt-1 border-t border-[#E4E4E7]">
              <span className="text-[#09090B]">Total</span>
              <span className="text-[#F97316]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="mt-2 border-t border-[#E4E4E7] pt-1.5">
            <p className="text-[8px] text-[#71717A] leading-relaxed line-clamp-2">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
