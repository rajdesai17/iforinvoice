"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

interface ClientSelectorProps {
  clients: Client[];
  value: string;
  onChange: (clientId: string) => void;
  onAddNew?: () => void;
  error?: string;
}

export function ClientSelector({
  clients,
  value,
  onChange,
  onAddNew,
  error,
}: ClientSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedClient = clients.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-secondary border-0 rounded-xl h-10 text-left font-normal",
              !selectedClient && "text-muted-foreground",
              error && "ring-2 ring-destructive"
            )}
          >
            {selectedClient ? (
              <div className="flex items-center gap-2 truncate">
                {selectedClient.company ? (
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="truncate">
                  {selectedClient.company || selectedClient.name}
                </span>
              </div>
            ) : (
              <span>Select a client</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-card border-border">
          <Command className="bg-transparent">
            <CommandInput 
              placeholder="Search clients..." 
              className="h-10 border-0"
            />
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No clients found.
              </CommandEmpty>
              <CommandGroup>
                {clients.map((client) => (
                  <CommandItem
                    key={client.id}
                    value={`${client.name} ${client.company || ""} ${client.email || ""}`}
                    onSelect={() => {
                      onChange(client.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer py-3"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === client.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">
                        {client.company || client.name}
                      </span>
                      {client.company && (
                        <span className="text-xs text-muted-foreground truncate">
                          {client.name}
                        </span>
                      )}
                      {client.email && (
                        <span className="text-xs text-muted-foreground truncate">
                          {client.email}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {onAddNew && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        onAddNew();
                      }}
                      className="cursor-pointer py-3 text-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add new client
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
