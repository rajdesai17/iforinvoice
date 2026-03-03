"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
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
import { CalendarIcon, Plus, Trash2, Loader2, Save, ChevronDown, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createInvoice } from "@/app/(dashboard)/invoices/actions";
import { isSessionExpired } from "@/lib/client/action-helpers";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  unit: string | null;
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

function SectionCard({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors duration-150">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-150",
            isOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <div className="h-px bg-border" />
        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {children}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
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
        router.push(`/invoices/${result.data.invoice.id}`);
      } else {
        if (isSessionExpired(result)) return;
        toast.error(result.error || "Failed to create invoice");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Custom input styles for theme
  const inputClassName = "bg-secondary border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary h-10";
  const labelClassName = "text-xs text-muted-foreground";

  return (
    <div className="min-h-full">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-sm bg-primary" />
            <h1 className="text-lg font-semibold text-foreground">New Invoice</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              onClick={() => handleSubmit("sent")} 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Download className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Two Columns */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Left: Form Panel (55%) */}
        <div className="w-[55%] p-6 space-y-4 overflow-y-auto h-full">
          {/* Invoice Details */}
          <SectionCard title="Invoice Details">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClassName}>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className={cn(inputClassName, "font-mono")}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClassName}>Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger className={inputClassName}>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-foreground hover:bg-secondary">
                        {client.company || client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClassName}>Issue Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        inputClassName,
                        "w-full justify-start text-left font-normal border-0",
                        !issueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {issueDate ? format(issueDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border">
                    <Calendar
                      mode="single"
                      selected={issueDate}
                      onSelect={(date) => date && setIssueDate(date)}
                      initialFocus
                      className="bg-card"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className={labelClassName}>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        inputClassName,
                        "w-full justify-start text-left font-normal border-0",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-border">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => date && setDueDate(date)}
                      initialFocus
                      className="bg-card"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </SectionCard>

          {/* Line Items */}
          <SectionCard title="Line Items">
            {items.length > 0 && (
              <div className="flex justify-end mb-2">
                <Select onValueChange={(value) => addFromLibrary(items.find((i) => i.id === value)!)}>
                  <SelectTrigger className="w-[180px] bg-secondary border-0 rounded-lg text-sm text-muted-foreground">
                    <SelectValue placeholder="Add from library" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="text-foreground hover:bg-secondary">
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="space-y-3">
                  {index > 0 && <div className="h-px bg-border" />}
                  <div className="grid gap-3">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                      className={inputClassName}
                    />
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className={labelClassName}>Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                          }
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className={labelClassName}>Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                          }
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className={labelClassName}>Amount</Label>
                        <Input
                          value={`$${item.amount.toFixed(2)}`}
                          disabled
                          className={cn(inputClassName, "text-[#9ca3af]")}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg h-10 w-10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={addLineItem} 
              className="w-full bg-transparent border-dashed border-primary/30 hover:bg-secondary hover:border-primary/50 text-muted-foreground rounded-xl h-10"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Line Item
            </Button>
          </SectionCard>

          {/* Tax & Discount */}
          <SectionCard title="Tax & Discount">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className={labelClassName}>Tax Rate (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClassName}>Discount</Label>
                <div className="flex gap-2">
                  <Select
                    value={discountType}
                    onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
                  >
                    <SelectTrigger className={cn(inputClassName, "w-[80px]")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="percentage" className="text-foreground hover:bg-secondary">%</SelectItem>
                      <SelectItem value="fixed" className="text-foreground hover:bg-secondary">$</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className={cn(inputClassName, "flex-1")}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Notes */}
          <SectionCard title="Notes & Terms" defaultOpen={false}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={labelClassName}>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes for your client..."
                  rows={2}
                  className={cn(inputClassName, "h-auto min-h-[60px] resize-none")}
                />
              </div>
              <div className="space-y-2">
                <Label className={labelClassName}>Terms & Conditions</Label>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment terms, late fees, etc..."
                  rows={2}
                  className={cn(inputClassName, "h-auto min-h-[60px] resize-none")}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right: Preview Panel (45%) */}
        <div className="w-[45%] h-full bg-white overflow-hidden">
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
