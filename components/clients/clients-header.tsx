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
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-sm bg-primary" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Clients</h1>
            <p className="text-sm text-muted-foreground">
              Manage your clients and their contact information
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setOpen(true)} 
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>
      <ClientDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
