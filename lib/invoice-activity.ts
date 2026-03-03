import { db } from "@/lib/db";
import { invoiceActivities } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

type ActivityAction =
  | "created"
  | "updated"
  | "status_changed"
  | "duplicated"
  | "downloaded";

export async function logInvoiceActivity(
  invoiceId: string,
  userId: string,
  action: ActivityAction,
  details?: Record<string, unknown>,
) {
  await db.insert(invoiceActivities).values({
    invoiceId,
    userId,
    action,
    details: details ?? null,
  });
}

export async function getInvoiceActivities(invoiceId: string) {
  return db
    .select()
    .from(invoiceActivities)
    .where(eq(invoiceActivities.invoiceId, invoiceId))
    .orderBy(desc(invoiceActivities.createdAt));
}
