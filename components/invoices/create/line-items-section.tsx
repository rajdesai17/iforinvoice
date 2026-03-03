"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItemRow } from "./line-item-row";
import type { LineItemFormData } from "@/lib/validations/invoice";

interface Item {
  id: string;
  name: string;
  description: string | null;
  rate: string;
}

interface LineItemsSectionProps {
  lineItems: LineItemFormData[];
  currency: string;
  items: Item[]; // Items library
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof LineItemFormData, value: string | number) => void;
  onAddFromLibrary: (item: Item) => void;
}

export function LineItemsSection({
  lineItems,
  currency,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onAddFromLibrary,
}: LineItemsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Library selector */}
      {items.length > 0 && (
        <div className="flex justify-end">
          <Select onValueChange={(value) => {
            const item = items.find((i) => i.id === value);
            if (item) onAddFromLibrary(item);
          }}>
            <SelectTrigger className="w-[180px] bg-secondary border-0 rounded-lg text-sm text-muted-foreground">
              <SelectValue placeholder="Add from library" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {items.map((item) => (
                <SelectItem 
                  key={item.id} 
                  value={item.id}
                  className="hover:bg-secondary"
                >
                  <span className="flex items-center justify-between w-full gap-2">
                    <span className="truncate">{item.name}</span>
                    <span className="text-muted-foreground text-xs font-mono">${item.rate}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Line items list */}
      <div className="space-y-4">
        {lineItems.map((item, index) => (
          <LineItemRow
            key={item.id}
            item={item}
            index={index}
            currency={currency}
            canDelete={lineItems.length > 1}
            onUpdate={(field, value) => onUpdateItem(item.id, field, value)}
            onRemove={() => onRemoveItem(item.id)}
          />
        ))}
      </div>

      {/* Add button */}
      <Button
        type="button"
        variant="outline"
        onClick={onAddItem}
        className="w-full bg-transparent border-dashed border-border hover:bg-secondary hover:border-muted-foreground text-muted-foreground rounded-xl h-10"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  );
}
