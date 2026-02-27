"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileText } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: string;
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
  const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    draft: { variant: "secondary", label: "Draft" },
    sent: { variant: "default", label: "Sent" },
    viewed: { variant: "default", label: "Viewed" },
    paid: { variant: "outline", label: "Paid" },
    overdue: { variant: "destructive", label: "Overdue" },
    cancelled: { variant: "secondary", label: "Cancelled" },
  };

  const config = statusConfig[status] || { variant: "secondary" as const, label: status };

  return (
    <Badge variant={config.variant} className={status === "paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
      {config.label}
    </Badge>
  );
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Your latest invoicing activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No invoices yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first invoice to get started
            </p>
            <Button asChild>
              <Link href="/invoices/new">Create Invoice</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Your latest invoicing activity</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/invoices" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.clientCompany || invoice.clientName || "No client"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="font-medium">{formatCurrency(invoice.total)}</p>
                  <p className="text-sm text-muted-foreground">
                    Due {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                  </p>
                </div>
                {getStatusBadge(invoice.status)}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
