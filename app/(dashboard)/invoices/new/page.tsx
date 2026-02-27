import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clients, items, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { InvoiceBuilder } from "@/components/invoices/invoice-builder";

export const metadata = {
  title: "New Invoice",
};

async function getData(userId: string) {
  const [clientsList, itemsList, profile] = await Promise.all([
    db
      .select({ id: clients.id, name: clients.name, company: clients.company, email: clients.email })
      .from(clients)
      .where(and(eq(clients.userId, userId), eq(clients.isArchived, false))),
    db
      .select({ id: items.id, name: items.name, description: items.description, rate: items.rate, unit: items.unit })
      .from(items)
      .where(eq(items.userId, userId)),
    db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId))
      .limit(1),
  ]);

  return {
    clients: clientsList,
    items: itemsList,
    profile: profile[0] || null,
  };
}

export default async function NewInvoicePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const data = await getData(session.user.id);

  // Generate next invoice number
  const prefix = data.profile?.invoicePrefix || "INV";
  const nextNumber = data.profile?.nextInvoiceNumber || 1;
  const invoiceNumber = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

  return (
    <div className="p-4 lg:p-6">
      <InvoiceBuilder
        clients={data.clients}
        items={data.items}
        defaultInvoiceNumber={invoiceNumber}
        defaultPaymentTerms={data.profile?.defaultPaymentTerms || 30}
        businessProfile={data.profile}
      />
    </div>
  );
}
