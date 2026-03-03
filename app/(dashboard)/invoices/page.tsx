import Link from "next/link";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoicesList } from "@/components/invoices/invoices-list";
import { requireCurrentUserId } from "@/lib/auth/current-user";

export const metadata = {
  title: "Invoices",
};

async function getInvoices(userId: string) {
  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      total: invoices.total,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      clientName: clients.name,
      clientCompany: clients.company,
      clientEmail: clients.email,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt));
}

export default async function InvoicesPage() {
  const userId = await requireCurrentUserId();
  const invoicesData = await getInvoices(userId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-sm bg-primary" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage your invoices
            </p>
          </div>
        </div>
        <Button asChild className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>
      <InvoicesList invoices={invoicesData} />
    </div>
  );
}
