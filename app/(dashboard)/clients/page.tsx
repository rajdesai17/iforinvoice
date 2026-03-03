import { Suspense } from "react";
import { db } from "@/lib/db";
import { clients, invoices } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { ClientsList } from "@/components/clients/clients-list";
import { ClientsHeader } from "@/components/clients/clients-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requireCurrentUserId } from "@/lib/auth/current-user";

export const metadata = {
  title: "Clients",
};

async function getClients(userId: string) {
  const clientsWithStats = await db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
      isArchived: clients.isArchived,
      createdAt: clients.createdAt,
      invoiceCount: sql<number>`COUNT(${invoices.id})::int`,
      totalBilled: sql<string>`COALESCE(SUM(${invoices.total}), 0)`,
    })
    .from(clients)
    .leftJoin(invoices, eq(clients.id, invoices.clientId))
    .where(and(eq(clients.userId, userId), eq(clients.isArchived, false)))
    .groupBy(clients.id)
    .orderBy(desc(clients.createdAt));

  return clientsWithStats;
}

function ClientsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export default async function ClientsPage() {
  const userId = await requireCurrentUserId();
  const clientsData = await getClients(userId);

  return (
    <div className="p-6 space-y-6">
      <ClientsHeader />
      <Suspense fallback={<ClientsLoading />}>
        <ClientsList clients={clientsData} />
      </Suspense>
    </div>
  );
}
