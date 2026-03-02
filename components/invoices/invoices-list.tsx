"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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

  const inputClassName = "bg-secondary border-0 rounded-xl text-navy-alice placeholder:text-navy-harper focus:ring-2 focus:ring-navy-door h-10";

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-16">
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full bg-secondary p-4 mb-4">
            <FileText className="h-8 w-8 text-navy-harper" />
          </div>
          <h3 className="font-medium text-lg mb-1 text-navy-alice">No invoices yet</h3>
          <p className="text-navy-harper text-center mb-4 max-w-sm">
            Create your first invoice to start getting paid
          </p>
          <Button asChild className="bg-navy-door hover:bg-navy-door/90 text-navy-alice rounded-full px-4">
            <Link href="/invoices/new">Create Invoice</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-harper" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClassName, "pl-9")}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={cn(inputClassName, "w-[150px]")}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all" className="text-navy-alice hover:bg-secondary">All Status</SelectItem>
            <SelectItem value="draft" className="text-navy-alice hover:bg-secondary">Draft</SelectItem>
            <SelectItem value="sent" className="text-navy-alice hover:bg-secondary">Sent</SelectItem>
            <SelectItem value="viewed" className="text-navy-alice hover:bg-secondary">Viewed</SelectItem>
            <SelectItem value="paid" className="text-navy-alice hover:bg-secondary">Paid</SelectItem>
            <SelectItem value="overdue" className="text-navy-alice hover:bg-secondary">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="rounded-xl bg-card border border-border py-8 text-center text-navy-harper">
          No invoices found matching your search
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border divide-y divide-border overflow-hidden">
          {filteredInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="p-4 hover:bg-secondary/50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="hidden sm:flex h-10 w-10 rounded-lg bg-navy-door/10 items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-navy-door" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-navy-alice font-mono text-sm hover:text-navy-door transition-colors"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                      {getStatusBadge(invoice.status || "draft")}
                    </div>
                    <p className="text-sm text-navy-harper truncate mt-0.5">
                      {invoice.clientCompany || invoice.clientName || "No client"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="font-medium text-navy-alice">{formatCurrency(invoice.total || "0")}</p>
                    <p className="text-xs text-navy-harper">
                      Due {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0 text-navy-harper hover:text-navy-alice hover:bg-secondary"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem asChild className="text-navy-alice hover:bg-secondary">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      {invoice.status === "draft" && (
                        <DropdownMenuItem asChild className="text-navy-alice hover:bg-secondary">
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild className="text-navy-alice hover:bg-secondary">
                        <Link href={`/api/invoices/${invoice.id}/pdf`}>
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      {invoice.status === "draft" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(invoice.id, "sent")}
                          className="text-navy-alice hover:bg-secondary"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Mark as Sent
                        </DropdownMenuItem>
                      )}
                      {(invoice.status === "sent" || invoice.status === "viewed") && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(invoice.id, "paid")}
                          className="text-navy-alice hover:bg-secondary"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Paid
                        </DropdownMenuItem>
                      )}
                      {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(invoice.id, "cancelled")}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
