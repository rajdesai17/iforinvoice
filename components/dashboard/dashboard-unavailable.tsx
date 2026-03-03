"use client";

import Link from "next/link";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardUnavailable() {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Database className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">
        Database temporarily unavailable
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        We couldn&apos;t connect to the database. This is often due to network
        issues, a firewall, or the database service starting up. Check your
        connection and try again.
      </p>
      <Button asChild variant="default">
        <Link href="/dashboard" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Link>
      </Button>
    </div>
  );
}
