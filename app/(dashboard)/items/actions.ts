"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface ItemData {
  name: string;
  description: string;
  rate: string;
  unit: string;
  isTaxable: boolean;
}

export async function createItem(data: ItemData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [item] = await db
      .insert(items)
      .values({
        userId: session.user.id,
        name: data.name,
        description: data.description || null,
        rate: data.rate,
        unit: data.unit as "hour" | "day" | "item" | "project",
        isTaxable: data.isTaxable,
      })
      .returning();

    revalidatePath("/items");
    
    return { success: true, item };
  } catch (error) {
    console.error("Failed to create item:", error);
    return { success: false, error: "Failed to create item" };
  }
}

export async function updateItem(itemId: string, data: ItemData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [item] = await db
      .update(items)
      .set({
        name: data.name,
        description: data.description || null,
        rate: data.rate,
        unit: data.unit as "hour" | "day" | "item" | "project",
        isTaxable: data.isTaxable,
        updatedAt: new Date(),
      })
      .where(and(eq(items.id, itemId), eq(items.userId, session.user.id)))
      .returning();

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    revalidatePath("/items");
    
    return { success: true, item };
  } catch (error) {
    console.error("Failed to update item:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function deleteItem(itemId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [item] = await db
      .delete(items)
      .where(and(eq(items.id, itemId), eq(items.userId, session.user.id)))
      .returning();

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    revalidatePath("/items");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete item:", error);
    return { success: false, error: "Failed to delete item" };
  }
}
