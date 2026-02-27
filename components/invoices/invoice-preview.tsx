"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    <Card className="overflow-hidden">
      <CardContent className="p-6 bg-background">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
              <p className="text-muted-foreground">{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{businessProfile?.businessName || "Your Business"}</p>
              {businessProfile?.email && (
                <p className="text-sm text-muted-foreground">{businessProfile.email}</p>
              )}
              {businessProfile?.addressLine1 && (
                <p className="text-sm text-muted-foreground">{businessProfile.addressLine1}</p>
              )}
              {(businessProfile?.city || businessProfile?.state) && (
                <p className="text-sm text-muted-foreground">
                  {[businessProfile?.city, businessProfile?.state, businessProfile?.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Billing Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bill To</p>
              {client ? (
                <>
                  <p className="font-medium">{client.company || client.name}</p>
                  {client.company && <p className="text-sm">{client.name}</p>}
                  {client.email && (
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground italic">Select a client</p>
              )}
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span>{format(issueDate, "MMM d, yyyy")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{format(dueDate, "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-medium">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="divide-y">
              {validLineItems.length > 0 ? (
                validLineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 p-3 text-sm">
                    <div className="col-span-6 truncate">{item.description}</div>
                    <div className="col-span-2 text-right">{item.quantity}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.unitPrice)}</div>
                    <div className="col-span-2 text-right">{formatCurrency(item.amount)}</div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No line items added
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
