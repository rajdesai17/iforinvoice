"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientDialog } from "@/components/clients/client-dialog";

export function ClientsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their contact information
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>
      <ClientDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
