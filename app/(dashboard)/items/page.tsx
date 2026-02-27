import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ItemsHeader } from "@/components/items/items-header";
import { ItemsList } from "@/components/items/items-list";

export const metadata = {
  title: "Items",
};

async function getItems(userId: string) {
  return db
    .select()
    .from(items)
    .where(eq(items.userId, userId))
    .orderBy(desc(items.createdAt));
}

export default async function ItemsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const itemsData = await getItems(session.user.id);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <ItemsHeader />
      <ItemsList items={itemsData} />
    </div>
  );
}
