"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Users, Search, MoreHorizontal, Mail, Phone, FileText, Pencil, Archive } from "lucide-react";
import { ClientDialog } from "@/components/clients/client-dialog";
import { archiveClient } from "@/app/(dashboard)/clients/actions";
import { toast } from "sonner";
import { isSessionExpired } from "@/lib/client/action-helpers";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  isArchived: boolean | null;
  createdAt: Date;
  invoiceCount: number;
  totalBilled: string;
}

interface ClientsListProps {
  clients: Client[];
}

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(typeof amount === "string" ? parseFloat(amount) : amount);
}

export function ClientsList({ clients }: ClientsListProps) {
  const [search, setSearch] = useState("");
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase()) ||
      client.company?.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (clientId: string) => {
    const result = await archiveClient(clientId);
    if (result.success) {
      toast.success("Client archived");
    } else {
      if (isSessionExpired(result)) return;
      toast.error(result.error || "Failed to archive client");
    }
  };

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">No clients yet</h3>
          <p className="text-muted-foreground text-center mb-4 max-w-sm">
            Add your first client to start creating invoices
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
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No clients found matching your search
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{client.name}</h3>
                        {client.company && (
                          <Badge variant="secondary" className="hidden sm:inline-flex">
                            {client.company}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {client.email && (
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </span>
                        )}
                        {client.phone && (
                          <span className="hidden md:flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <p className="font-medium">{formatCurrency(client.totalBilled)}</p>
                      <p className="text-sm text-muted-foreground">
                        {client.invoiceCount} invoice{client.invoiceCount !== 1 ? "s" : ""}
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
                        <DropdownMenuItem onClick={() => setEditingClient(client)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/new?client=${client.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Create Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleArchive(client.id)}
                          className="text-destructive"
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClientDialog
        open={!!editingClient}
        onOpenChange={(open) => !open && setEditingClient(null)}
        client={editingClient || undefined}
      />
    </div>
  );
}
