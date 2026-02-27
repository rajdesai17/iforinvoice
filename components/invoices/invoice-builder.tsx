"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Plus, Trash2, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createInvoice } from "@/app/(dashboard)/invoices/actions";
import { InvoicePreview } from "@/components/invoices/invoice-preview";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

interface Item {
  id: string;
  name: string;
  description: string | null;
  rate: string;
  unit: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface BusinessProfile {
  businessName: string | null;
  email: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

interface InvoiceBuilderProps {
  clients: Client[];
  items: Item[];
  defaultInvoiceNumber: string;
  defaultPaymentTerms: number;
  businessProfile: BusinessProfile | null;
}

export function InvoiceBuilder({
  clients,
  items,
  defaultInvoiceNumber,
  defaultPaymentTerms,
  businessProfile,
}: InvoiceBuilderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber);
  const [clientId, setClientId] = useState<string>("");
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), defaultPaymentTerms));
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  const selectedClient = clients.find((c) => c.id === clientId);

  // Calculations
  const { subtotal, taxAmount, discountAmount, total } = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount =
      discountType === "percentage" ? subtotal * (discountValue / 100) : discountValue;
    const total = subtotal + taxAmount - discountAmount;
    return { subtotal, taxAmount, discountAmount, total };
  }, [lineItems, taxRate, discountType, discountValue]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), description: "", quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addFromLibrary = (libraryItem: Item) => {
    setLineItems([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        description: libraryItem.name + (libraryItem.description ? ` - ${libraryItem.description}` : ""),
        quantity: 1,
        unitPrice: parseFloat(libraryItem.rate),
        amount: parseFloat(libraryItem.rate),
      },
    ]);
  };

  const handleSubmit = async (status: "draft" | "sent") => {
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }

    if (lineItems.every((item) => !item.description || item.amount === 0)) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createInvoice({
        invoiceNumber,
        clientId,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status,
        lineItems: lineItems.filter((item) => item.description && item.amount > 0),
        taxRate,
        discountType,
        discountValue,
        notes,
        terms,
        subtotal,
        taxAmount,
        discountAmount,
        total,
      });

      if (result.success) {
        toast.success(status === "draft" ? "Invoice saved as draft" : "Invoice created and ready to send");
        router.push(`/invoices/${result.invoice?.id}`);
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left: Form */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">New Invoice</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit("sent")} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !issueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {issueDate ? format(issueDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={issueDate}
                      onSelect={(date) => date && setIssueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            {items.length > 0 && (
              <Select onValueChange={(value) => addFromLibrary(items.find((i) => i.id === value)!)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add from library" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={item.id} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="grid gap-3">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Qty</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Amount</Label>
                      <Input
                        value={`$${item.amount.toFixed(2)}`}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addLineItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Line Item
            </Button>
          </CardContent>
        </Card>

        {/* Tax & Discount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax & Discount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount</Label>
                <div className="flex gap-2">
                  <Select
                    value={discountType}
                    onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes for your client..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Payment terms, late fees, etc..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <InvoicePreview
            invoiceNumber={invoiceNumber}
            client={selectedClient}
            businessProfile={businessProfile}
            issueDate={issueDate}
            dueDate={dueDate}
            lineItems={lineItems}
            subtotal={subtotal}
            taxRate={taxRate}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            total={total}
            notes={notes}
          />
        </div>
      </div>
    </div>
  );
}
