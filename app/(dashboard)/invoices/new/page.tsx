import { db } from "@/lib/db";
import { clients, items, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { InvoicePageLayout } from "@/components/invoices/create/invoice-page-layout";
import { requireCurrentUserId } from "@/lib/auth/current-user";

export const metadata = {
  title: "New Invoice",
};

async function getData(userId: string) {
  const [clientsList, itemsList, profile] = await Promise.all([
    db
      .select({
        id: clients.id,
        name: clients.name,
        company: clients.company,
        email: clients.email,
        addressLine1: clients.addressLine1,
        city: clients.city,
        state: clients.state,
        postalCode: clients.postalCode,
      })
      .from(clients)
      .where(and(eq(clients.userId, userId), eq(clients.isArchived, false))),
    db
      .select({
        id: items.id,
        name: items.name,
        description: items.description,
        rate: items.rate,
        unit: items.unit,
      })
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
  const userId = await requireCurrentUserId();
  const data = await getData(userId);

  // Generate next invoice number
  const prefix = data.profile?.invoicePrefix || "INV";
  const nextNumber = data.profile?.nextInvoiceNumber || 1;
  const invoiceNumber = `${prefix}-${String(nextNumber).padStart(4, "0")}`;

  return (
    <InvoicePageLayout
      clients={data.clients}
      items={data.items}
      defaultInvoiceNumber={invoiceNumber}
      defaultPaymentTerms={data.profile?.defaultPaymentTerms || 30}
      businessProfile={data.profile}
    />
  );
}
