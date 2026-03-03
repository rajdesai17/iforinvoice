"use client";

import { useCallback } from "react";
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const navigate = useCallback((url: string) => router.push(url), [router]);
  const replace = useCallback((url: string) => router.replace(url), [router]);
  const onSessionChange = useCallback(() => router.refresh(), [router]);

  return (
    <NeonAuthUIProvider
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authClient={authClient as any}
      navigate={navigate}
      replace={replace}
      onSessionChange={onSessionChange}
      Link={Link}
    >
      {children}
    </NeonAuthUIProvider>
  );
}
