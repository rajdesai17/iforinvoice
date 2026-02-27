"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Download,
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { updateInvoiceStatus } from "@/app/(dashboard)/invoices/actions";
import { toast } from "sonner";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string | null;
  total: string | null;
  issueDate: Date;
  dueDate: Date;
  clientName: string | null;
  clientCompany: string | null;
  clientEmail: string | null;
}

interface InvoicesListProps {
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
    draft: { className: "bg-secondary text-secondary-foreground", label: "Draft" },
    sent: { className: "bg-blue-100 text-blue-700", label: "Sent" },
    viewed: { className: "bg-amber-100 text-amber-700", label: "Viewed" },
    paid: { className: "bg-emerald-100 text-emerald-700", label: "Paid" },
    overdue: { className: "bg-red-100 text-red-700", label: "Overdue" },
    cancelled: { className: "bg-secondary text-muted-foreground", label: "Cancelled" },
  };

  const config = statusConfig[status] || { className: "bg-secondary text-secondary-foreground", label: status };

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      invoice.clientCompany?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || (invoice.status || "draft") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (invoiceId: string, status: string) => {
    const result = await updateInvoiceStatus(invoiceId, status);
    if (result.success) {
      toast.success(`Invoice marked as ${status}`);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No invoices yet</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-sm">
            Create your first invoice to start getting paid
          </p>
          <Button asChild>
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No invoices found matching your search
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="hidden sm:flex h-10 w-10 rounded-lg bg-primary/10 items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-medium hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        {getStatusBadge(invoice.status || "draft")}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {invoice.clientCompany || invoice.clientName || "No client"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="font-medium">{formatCurrency(invoice.total || "0")}</p>
                      <p className="text-sm text-muted-foreground">
                        Due {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/${invoice.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        {invoice.status === "draft" && (
                          <DropdownMenuItem asChild>
                            <Link href={`/invoices/${invoice.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/api/invoices/${invoice.id}/pdf`}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status === "draft" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(invoice.id, "sent")}
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === "sent" || invoice.status === "viewed") && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(invoice.id, "paid")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(invoice.id, "cancelled")}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
