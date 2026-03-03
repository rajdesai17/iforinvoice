import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, clients, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download } from "lucide-react";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { requireCurrentUserId } from "@/lib/auth/current-user";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Invoice ${id.slice(0, 8)}`,
  };
}

async function getInvoice(userId: string, invoiceId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)));

  if (!invoice) return null;

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, invoice.clientId));

  const lineItems = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoiceId))
    .orderBy(invoiceLineItems.sortOrder);

  const [profile] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.userId, userId));

  return { invoice, client, lineItems, profile };
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    draft: { className: "bg-secondary text-secondary-foreground", label: "Draft" },
    sent: { className: "bg-blue-100 text-blue-700", label: "Sent" },
    paid: { className: "bg-emerald-100 text-emerald-700", label: "Paid" },
    void: { className: "bg-secondary text-muted-foreground line-through", label: "Void" },
  };
  const config = statusConfig[status] || { className: "bg-secondary", label: status };
  return <Badge variant="secondary" className={config.className}>{config.label}</Badge>;
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireCurrentUserId();
  const data = await getInvoice(userId, id);

  if (!data) {
    notFound();
  }

  const { invoice, client, lineItems, profile } = data;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{invoice.invoiceNumber}</h1>
              {getStatusBadge(invoice.status || "draft")}
            </div>
            <p className="text-muted-foreground">
              {client?.company || client?.name || "Unknown client"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/api/invoices/${invoice.id}/pdf`}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Link>
          </Button>
          <InvoiceStatusActions invoice={invoice} />
        </div>
      </div>

      {/* Invoice Card */}
      <Card>
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-1">INVOICE</h2>
              <p className="text-lg text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">{profile?.businessName || "Your Business"}</p>
              {profile?.email && <p className="text-muted-foreground">{profile.email}</p>}
              {profile?.addressLine1 && <p className="text-muted-foreground">{profile.addressLine1}</p>}
              {(profile?.city || profile?.state) && (
                <p className="text-muted-foreground">
                  {[profile?.city, profile?.state, profile?.postalCode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Billing Info */}
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Bill To</p>
              <p className="font-semibold">{client?.company || client?.name}</p>
              {client?.company && client?.name && <p>{client.name}</p>}
              {client?.email && <p className="text-muted-foreground">{client.email}</p>}
              {client?.addressLine1 && <p className="text-muted-foreground">{client.addressLine1}</p>}
              {(client?.city || client?.state) && (
                <p className="text-muted-foreground">
                  {[client?.city, client?.state, client?.postalCode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="sm:text-right">
              <div className="space-y-2">
                <div className="flex sm:justify-end gap-8">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span className="font-medium">{format(new Date(invoice.issueDate), "MMM d, yyyy")}</span>
                </div>
                <div className="flex sm:justify-end gap-8">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">{format(new Date(invoice.dueDate), "MMM d, yyyy")}</span>
                </div>
                {invoice.paidAt && (
                  <div className="flex sm:justify-end gap-8">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-medium text-emerald-600">
                      {format(new Date(invoice.paidAt), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="border rounded-lg overflow-hidden mb-8">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted text-sm font-medium">
              <div className="col-span-6">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>
            <div className="divide-y">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4">
                  <div className="col-span-6">{item.description}</div>
                  <div className="col-span-2 text-right">{item.quantity}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.unitPrice || 0)}</div>
                  <div className="col-span-2 text-right">{formatCurrency(item.amount || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal || 0)}</span>
              </div>
              {parseFloat(String(invoice.taxRate || 0)) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({invoice.taxRate}%)</span>
                  <span>{formatCurrency(invoice.taxAmount || 0)}</span>
                </div>
              )}
              {parseFloat(String(invoice.discountAmount || 0)) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-{formatCurrency(invoice.discountAmount || 0)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-semibold">
                <span>Total</span>
                <span>{formatCurrency(invoice.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="border-t pt-6">
              <p className="font-medium mb-2">Notes</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {invoice.terms && (
            <div className="border-t pt-6 mt-6">
              <p className="font-medium mb-2">Terms & Conditions</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
