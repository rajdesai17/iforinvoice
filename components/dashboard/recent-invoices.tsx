"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string | null;
  total: string | null;
  dueDate: Date;
  clientName: string | null;
  clientCompany: string | null;
}

interface RecentInvoicesProps {
  invoices: Invoice[];
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
}

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    draft: { className: "bg-secondary text-navy-harper", label: "Draft" },
    sent: { className: "bg-navy-door/20 text-navy-alice", label: "Sent" },
    viewed: { className: "bg-navy-harper/20 text-navy-alice", label: "Viewed" },
    paid: { className: "bg-emerald-500/10 text-emerald-400", label: "Paid" },
    overdue: { className: "bg-red-500/10 text-red-400", label: "Overdue" },
    cancelled: { className: "bg-secondary text-navy-harper", label: "Cancelled" },
  };

  const config = statusConfig[status] || { className: "bg-secondary text-navy-harper", label: status };

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-navy-door">Recent Invoices</h3>
            <p className="text-xs text-navy-harper mt-1">Your latest invoicing activity</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <FileText className="h-8 w-8 text-navy-harper" />
          </div>
          <h3 className="font-medium text-navy-alice mb-1">No invoices yet</h3>
          <p className="text-sm text-navy-harper mb-4">
            Create your first invoice to get started
          </p>
          <Button asChild className="bg-navy-door hover:bg-navy-door/90 text-navy-alice rounded-full px-4">
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-navy-door">Recent Invoices</h3>
          <p className="text-xs text-navy-harper mt-0.5">Your latest invoicing activity</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="text-navy-harper hover:text-navy-alice hover:bg-secondary"
        >
          <Link href="/invoices" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-border">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/invoices/${invoice.id}`}
            className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors duration-150"
          >
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-5 w-5 text-navy-harper" />
              </div>
              <div>
                <p className="font-medium text-navy-alice font-mono text-sm">{invoice.invoiceNumber}</p>
                <p className="text-sm text-navy-harper">
                  {invoice.clientCompany || invoice.clientName || "No client"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-navy-alice">{formatCurrency(invoice.total || "0")}</p>
                <p className="text-xs text-navy-harper">
                  Due {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                </p>
              </div>
              {getStatusBadge(invoice.status || "draft")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
