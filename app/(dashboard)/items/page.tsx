import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ItemsHeader } from "@/components/items/items-header";
import { ItemsList } from "@/components/items/items-list";
import { requireCurrentUserId } from "@/lib/auth/current-user";

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
  const userId = await requireCurrentUserId();
  const itemsData = await getItems(userId);

  return (
    <div className="p-6 space-y-6">
      <ItemsHeader />
      <ItemsList items={itemsData} />
    </div>
  );
}
