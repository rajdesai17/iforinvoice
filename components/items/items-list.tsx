"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Package, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { ItemDialog } from "@/components/items/item-dialog";
import { deleteItem } from "@/app/(dashboard)/items/actions";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  description: string | null;
  rate: string;
  unit: string;
  isTaxable: boolean;
  createdAt: Date;
}

interface ItemsListProps {
  items: Item[];
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
}

function formatUnit(unit: string) {
  const units: Record<string, string> = {
    hour: "/hr",
    day: "/day",
    item: "/item",
    project: "/project",
  };
  return units[unit] || "";
}

export function ItemsList({ items }: ItemsListProps) {
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (itemId: string) => {
    const result = await deleteItem(itemId);
    if (result.success) {
      toast.success("Item deleted");
    } else {
      toast.error(result.error || "Failed to delete item");
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No items yet</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-sm">
            Add services or products to quickly add them to invoices
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No items found matching your search
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      {item.isTaxable && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          Taxable
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="text-lg font-semibold mt-2">
                      {formatCurrency(item.rate)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {formatUnit(item.unit)}
                      </span>
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingItem(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ItemDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem || undefined}
      />
    </div>
  );
}
