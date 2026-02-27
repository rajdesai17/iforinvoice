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
    draft: { className: "bg-[#1a1a1e] text-[#9ca3af]", label: "Draft" },
    sent: { className: "bg-blue-500/10 text-blue-400", label: "Sent" },
    viewed: { className: "bg-purple-500/10 text-purple-400", label: "Viewed" },
    paid: { className: "bg-emerald-500/10 text-emerald-400", label: "Paid" },
    overdue: { className: "bg-red-500/10 text-red-400", label: "Overdue" },
    cancelled: { className: "bg-[#1a1a1e] text-[#6b7280]", label: "Cancelled" },
  };

  const config = statusConfig[status] || { className: "bg-[#1a1a1e] text-[#9ca3af]", label: status };

  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-xl bg-[#111113] border border-[#1e1e21] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">Recent Invoices</h3>
            <p className="text-xs text-[#6b7280] mt-1">Your latest invoicing activity</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-[#1a1a1e] p-4 mb-4">
            <FileText className="h-8 w-8 text-[#6b7280]" />
          </div>
          <h3 className="font-medium text-white mb-1">No invoices yet</h3>
          <p className="text-sm text-[#6b7280] mb-4">
            Create your first invoice to get started
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 text-white rounded-full px-4">
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#111113] border border-[#1e1e21] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#1e1e21]">
        <div>
          <h3 className="text-sm font-semibold text-primary">Recent Invoices</h3>
          <p className="text-xs text-[#6b7280] mt-0.5">Your latest invoicing activity</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="text-[#9ca3af] hover:text-white hover:bg-[#1a1a1e]"
        >
          <Link href="/invoices" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="divide-y divide-[#1e1e21]">
        {invoices.map((invoice) => (
          <Link
            key={invoice.id}
            href={`/invoices/${invoice.id}`}
            className="flex items-center justify-between p-4 hover:bg-[#1a1a1e]/50 transition-colors duration-150"
          >
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a1e]">
                <FileText className="h-5 w-5 text-[#6b7280]" />
              </div>
              <div>
                <p className="font-medium text-white font-mono text-sm">{invoice.invoiceNumber}</p>
                <p className="text-sm text-[#6b7280]">
                  {invoice.clientCompany || invoice.clientName || "No client"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-white">{formatCurrency(invoice.total || "0")}</p>
                <p className="text-xs text-[#6b7280]">
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
