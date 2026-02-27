import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoicesList } from "@/components/invoices/invoices-list";

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
  const session = await auth.api.getSession({
    headers: await cookies(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const invoicesData = await getInvoices(session.user.id);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Create and manage your invoices
          </p>
        </div>
        <Button asChild className="gap-2">
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
