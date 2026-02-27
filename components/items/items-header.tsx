"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ItemDialog } from "@/components/items/item-dialog";

export function ItemsHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Items Library</h1>
          <p className="text-muted-foreground">
            Saved services and products for quick invoice creation
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>
      <ItemDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
