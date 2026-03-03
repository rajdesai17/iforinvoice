import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, clients, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download } from "lucide-react";
import { InvoiceStatusActions } from "@/components/invoices/invoice-status-actions";
import { requireCurrentUserId } from "@/lib/auth/current-user";
import { formatCurrency } from "@/lib/currencies";

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
  const currency = invoice.currency || "USD";

  const displayCompanyName = profile?.businessName || "Your Business";
  const displayCompanyAddress = [profile?.addressLine1, profile?.city, profile?.state, profile?.postalCode]
    .filter(Boolean)
    .join(", ");

  const fmtCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return formatCurrency(isNaN(num) ? 0 : num, currency);
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Action Bar */}
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

      {/* A4 Invoice Document */}
      <div className="mx-auto bg-white shadow-lg border border-gray-200 rounded-sm" style={{ maxWidth: "794px", minHeight: "1123px" }}>
        <div className="flex flex-col p-10 sm:p-14">
          {/* Header - Invoice Title */}
          <div className="mb-6">
            <h2 className="text-3xl font-semibold text-primary font-mono tracking-tight">
              Invoice {invoice.invoiceNumber}
            </h2>
          </div>

          {/* Metadata Grid */}
          <div className="flex gap-10 text-sm mb-8">
            <div>
              <p className="text-gray-400 mb-1">Serial Number</p>
              <p className="text-gray-700 font-medium">{invoice.invoiceNumber.replace("INV-", "")}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Issue Date</p>
              <p className="text-gray-700 font-medium">{format(new Date(invoice.issueDate), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Due Date</p>
              <p className="text-gray-700 font-medium">{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Currency</p>
              <p className="text-gray-700 font-medium">{currency}</p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-gray-400 mb-1">Paid</p>
                <p className="text-emerald-600 font-medium">{format(new Date(invoice.paidAt), "dd/MM/yyyy")}</p>
              </div>
            )}
          </div>

          {/* Billing Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="text-primary font-medium text-xs mb-2">Billed By</h3>
              <p className="font-semibold text-gray-900">{displayCompanyName}</p>
              {profile?.email && (
                <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
              )}
              {displayCompanyAddress && (
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{displayCompanyAddress}</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
              <h3 className="text-primary font-medium text-xs mb-2">Billed To</h3>
              <p className="font-semibold text-gray-900">{client?.company || client?.name || "Unknown"}</p>
              {client?.company && client?.name && (
                <p className="text-gray-500 text-sm mt-1">{client.name}</p>
              )}
              {client?.email && (
                <p className="text-gray-500 text-sm mt-1">{client.email}</p>
              )}
              {(client?.addressLine1 || client?.city) && (
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                  {[client?.addressLine1, client?.city, client?.state, client?.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="rounded-lg overflow-hidden border border-gray-200 mb-8">
            <div className="bg-primary text-white text-sm font-semibold">
              <div className="grid grid-cols-12 gap-3 px-5 py-3">
                <div className="col-span-5">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-3 text-right">Total</div>
              </div>
            </div>
            <div className="bg-white divide-y divide-gray-100">
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 px-5 py-3 text-sm">
                  <div className="col-span-5 text-gray-900">{item.description}</div>
                  <div className="col-span-2 text-center text-gray-600">{item.quantity}</div>
                  <div className="col-span-2 text-right text-gray-600">{fmtCurrency(item.unitPrice || 0)}</div>
                  <div className="col-span-3 text-right text-gray-900 font-medium">{fmtCurrency(item.amount || 0)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{fmtCurrency(invoice.subtotal || 0)}</span>
              </div>
              {parseFloat(String(invoice.taxRate || 0)) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax ({invoice.taxRate}%)</span>
                  <span className="text-gray-900">{fmtCurrency(invoice.taxAmount || 0)}</span>
                </div>
              )}
              {parseFloat(String(invoice.discountAmount || 0)) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-{fmtCurrency(invoice.discountAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-3 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-primary">{fmtCurrency(invoice.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {invoice.notes && (
            <div className="border-t border-gray-200 pt-6 mb-4">
              <p className="font-medium text-sm text-gray-900 mb-2">Notes</p>
              <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div className="border-t border-gray-200 pt-6 mb-4">
              <p className="font-medium text-sm text-gray-900 mb-2">Terms & Conditions</p>
              <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{invoice.terms}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-auto pt-8 text-center">
            <p className="text-gray-300 text-xs">Generated by iforinvoice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
