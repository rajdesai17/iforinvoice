"use client";

import { useCallback, useEffect, useRef } from "react";
import { NeonAuthUIProvider } from "@neondatabase/auth/react/ui";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isMountedRef = useRef(true);
  const refreshQueuedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runAfterRender = useCallback((callback: () => void) => {
    setTimeout(() => {
      if (!isMountedRef.current) return;
      callback();
    }, 0);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      runAfterRender(() => router.push(url));
    },
    [router, runAfterRender],
  );

  const replace = useCallback(
    (url: string) => {
      runAfterRender(() => router.replace(url));
    },
    [router, runAfterRender],
  );

  const onSessionChange = useCallback(() => {
    if (refreshQueuedRef.current) return;
    refreshQueuedRef.current = true;
    runAfterRender(() => {
      refreshQueuedRef.current = false;
      router.refresh();
    });
  }, [router, runAfterRender]);

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
