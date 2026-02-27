"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DEMO_USER_ID } from "../layout";

interface ItemData {
  name: string;
  description: string;
  rate: string;
  unit: string;
  isTaxable: boolean;
}

export async function createItem(data: ItemData) {
  try {
    const userId = DEMO_USER_ID;

    const [item] = await db
      .insert(items)
      .values({
        userId,
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
    const userId = DEMO_USER_ID;

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
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
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
    const userId = DEMO_USER_ID;

    const [item] = await db
      .delete(items)
      .where(and(eq(items.id, itemId), eq(items.userId, userId)))
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
