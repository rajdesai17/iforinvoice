import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { sessions } from "@/lib/db/schema";
import { env } from "@/lib/env";

const SESSION_COOKIE_NAMES = [
  "better-auth.session_token",
  "better-auth.session-token",
  "session_token",
  "auth_session",
];

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

async function getSessionTokenFromRequest() {
  const cookieStore = await cookies();
  for (const cookieName of SESSION_COOKIE_NAMES) {
    const token = cookieStore.get(cookieName)?.value;
    if (token) {
      return token;
    }
  }

  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

export async function getCurrentUserId(): Promise<string | null> {
  const sessionToken = await getSessionTokenFromRequest();

  if (sessionToken) {
    const [session] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(and(eq(sessions.token, sessionToken), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (session?.userId) {
      return session.userId;
    }
  }

  if (env.NODE_ENV !== "production" && env.DEMO_USER_ID) {
    return env.DEMO_USER_ID;
  }

  return null;
}

export async function requireCurrentUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new AuthenticationError();
  }
  return userId;
}
