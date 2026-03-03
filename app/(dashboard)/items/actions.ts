"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  AuthenticationError,
  requireCurrentUserId,
} from "@/lib/auth/current-user";
import { fail, ok, type ActionResult } from "@/lib/server/action-response";
import { logServerError } from "@/lib/server/logger";
import { idSchema, itemInputSchema } from "@/lib/validations/actions";

export async function createItem(
  data: unknown,
): Promise<ActionResult<{ item: typeof items.$inferSelect }>> {
  const parsedInput = itemInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid item input");
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsedInput.data;

    const [item] = await db
      .insert(items)
      .values({
        userId,
        name: payload.name,
        description: payload.description || null,
        rate: payload.rate,
        unit: payload.unit,
        isTaxable: payload.isTaxable,
      })
      .returning();

    revalidatePath("/items");

    return ok("Item created", { item });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("items.createItem", error);
    return fail("INTERNAL_ERROR", "Failed to create item");
  }
}

export async function updateItem(
  itemId: string,
  data: unknown,
): Promise<ActionResult<{ item: typeof items.$inferSelect }>> {
  const parsedId = idSchema.safeParse(itemId);
  if (!parsedId.success) {
    return fail("VALIDATION_ERROR", "Invalid item id");
  }

  const parsedInput = itemInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid item input");
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsedInput.data;

    const [item] = await db
      .update(items)
      .set({
        name: payload.name,
        description: payload.description || null,
        rate: payload.rate,
        unit: payload.unit,
        isTaxable: payload.isTaxable,
        updatedAt: new Date(),
      })
      .where(and(eq(items.id, parsedId.data), eq(items.userId, userId)))
      .returning();

    if (!item) {
      return fail("NOT_FOUND", "Item not found");
    }

    revalidatePath("/items");

    return ok("Item updated", { item });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("items.updateItem", error, { itemId });
    return fail("INTERNAL_ERROR", "Failed to update item");
  }
}

export async function deleteItem(
  itemId: string,
): Promise<ActionResult<{ itemId: string }>> {
  const parsedId = idSchema.safeParse(itemId);
  if (!parsedId.success) {
    return fail("VALIDATION_ERROR", "Invalid item id");
  }

  try {
    const userId = await requireCurrentUserId();

    const [item] = await db
      .delete(items)
      .where(and(eq(items.id, parsedId.data), eq(items.userId, userId)))
      .returning({ id: items.id });

    if (!item) {
      return fail("NOT_FOUND", "Item not found");
    }

    revalidatePath("/items");

    return ok("Item deleted", { itemId: item.id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("items.deleteItem", error, { itemId });
    return fail("INTERNAL_ERROR", "Failed to delete item");
  }
}
