"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Send, CheckCircle, XCircle, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateInvoiceStatus } from "@/app/(dashboard)/invoices/actions";
import { isSessionExpired } from "@/lib/client/action-helpers";

interface Invoice {
  id: string;
  status: string | null;
}

interface InvoiceStatusActionsProps {
  invoice: Invoice;
}

export function InvoiceStatusActions({ invoice }: InvoiceStatusActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    setIsLoading(true);
    try {
      const result = await updateInvoiceStatus(invoice.id, status);
      if (result.success) {
        toast.success(`Invoice marked as ${status}`);
        router.refresh();
      } else {
        if (isSessionExpired(result)) return;
        toast.error(result.error || "Failed to update status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (invoice.status === "paid" || invoice.status === "void") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="mr-2 h-4 w-4" />
          )}
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {invoice.status === "draft" && (
          <DropdownMenuItem onClick={() => handleStatusChange("sent")}>
            <Send className="mr-2 h-4 w-4" />
            Mark as Sent
          </DropdownMenuItem>
        )}
        {invoice.status === "sent" && (
          <DropdownMenuItem onClick={() => handleStatusChange("paid")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Paid
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleStatusChange("void")}
          className="text-destructive"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Void Invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
