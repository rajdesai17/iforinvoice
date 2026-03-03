"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  AuthenticationError,
  requireCurrentUserId,
} from "@/lib/auth/current-user";
import { fail, ok, type ActionResult } from "@/lib/server/action-response";
import { logServerError } from "@/lib/server/logger";
import { clientInputSchema, idSchema } from "@/lib/validations/actions";

export async function createClient(
  data: unknown,
): Promise<ActionResult<{ client: typeof clients.$inferSelect }>> {
  const parsedInput = clientInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid client input");
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsedInput.data;

    const [client] = await db
      .insert(clients)
      .values({
        userId,
        name: payload.name,
        email: payload.email || null,
        phone: payload.phone || null,
        company: payload.company || null,
        addressLine1: payload.addressLine1 || null,
        addressLine2: payload.addressLine2 || null,
        city: payload.city || null,
        state: payload.state || null,
        postalCode: payload.postalCode || null,
        country: payload.country || null,
        notes: payload.notes || null,
      })
      .returning();

    revalidatePath("/clients");
    revalidatePath("/invoices");

    return ok("Client created", { client });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("clients.createClient", error);
    return fail("INTERNAL_ERROR", "Failed to create client");
  }
}

export async function updateClient(
  clientId: string,
  data: unknown,
): Promise<ActionResult<{ client: typeof clients.$inferSelect }>> {
  const parsedId = idSchema.safeParse(clientId);
  if (!parsedId.success) {
    return fail("VALIDATION_ERROR", "Invalid client id");
  }

  const parsedInput = clientInputSchema.safeParse(data);
  if (!parsedInput.success) {
    return fail("VALIDATION_ERROR", parsedInput.error.issues[0]?.message ?? "Invalid client input");
  }

  try {
    const userId = await requireCurrentUserId();
    const payload = parsedInput.data;

    const [client] = await db
      .update(clients)
      .set({
        name: payload.name,
        email: payload.email || null,
        phone: payload.phone || null,
        company: payload.company || null,
        addressLine1: payload.addressLine1 || null,
        addressLine2: payload.addressLine2 || null,
        city: payload.city || null,
        state: payload.state || null,
        postalCode: payload.postalCode || null,
        country: payload.country || null,
        notes: payload.notes || null,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, parsedId.data), eq(clients.userId, userId)))
      .returning();

    if (!client) {
      return fail("NOT_FOUND", "Client not found");
    }

    revalidatePath("/clients");
    revalidatePath("/invoices");

    return ok("Client updated", { client });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("clients.updateClient", error, { clientId });
    return fail("INTERNAL_ERROR", "Failed to update client");
  }
}

export async function archiveClient(
  clientId: string,
): Promise<ActionResult<{ clientId: string }>> {
  const parsedId = idSchema.safeParse(clientId);
  if (!parsedId.success) {
    return fail("VALIDATION_ERROR", "Invalid client id");
  }

  try {
    const userId = await requireCurrentUserId();

    const [client] = await db
      .update(clients)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(and(eq(clients.id, parsedId.data), eq(clients.userId, userId)))
      .returning({ id: clients.id });

    if (!client) {
      return fail("NOT_FOUND", "Client not found");
    }

    revalidatePath("/clients");

    return ok("Client archived", { clientId: client.id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return fail("UNAUTHORIZED", "You must be signed in");
    }
    logServerError("clients.archiveClient", error, { clientId });
    return fail("INTERNAL_ERROR", "Failed to archive client");
  }
}
