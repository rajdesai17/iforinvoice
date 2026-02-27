"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { DEMO_USER_ID } from "../layout";

interface ClientData {
  name: string;
  email: string;
  phone: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

export async function createClient(data: ClientData) {
  try {
    const userId = DEMO_USER_ID;

    const [client] = await db
      .insert(clients)
      .values({
        userId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        notes: data.notes || null,
      })
      .returning();

    revalidatePath("/clients");
    revalidatePath("/invoices");
    
    return { success: true, client };
  } catch (error) {
    console.error("Failed to create client:", error);
    return { success: false, error: "Failed to create client" };
  }
}

export async function updateClient(clientId: string, data: ClientData) {
  try {
    const userId = DEMO_USER_ID;

    const [client] = await db
      .update(clients)
      .set({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        addressLine1: data.addressLine1 || null,
        addressLine2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        notes: data.notes || null,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
      .returning();

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    revalidatePath("/clients");
    revalidatePath("/invoices");
    
    return { success: true, client };
  } catch (error) {
    console.error("Failed to update client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

export async function archiveClient(clientId: string) {
  try {
    const userId = DEMO_USER_ID;

    const [client] = await db
      .update(clients)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, clientId), eq(clients.userId, userId)))
      .returning();

    if (!client) {
      return { success: false, error: "Client not found" };
    }

    revalidatePath("/clients");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to archive client:", error);
    return { success: false, error: "Failed to archive client" };
  }
}
