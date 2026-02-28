"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import type { InvoiceFormData } from "@/lib/validations/invoice";
import { CURRENCIES } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientSelector } from "./client-selector";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
}

interface InvoiceDetailsSectionProps {
  form: UseFormReturn<InvoiceFormData>;
  clients: Client[];
  onAddNewClient?: () => void;
}

const inputClassName = "bg-[#1a1a1e] border-0 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary h-10";
const labelClassName = "text-xs text-muted-foreground";

export function InvoiceDetailsSection({
  form,
  clients,
  onAddNewClient,
}: InvoiceDetailsSectionProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  
  const issueDate = watch("issueDate");
  const dueDate = watch("dueDate");
  const currency = watch("currency");
  const clientId = watch("clientId");

  return (
    <div className="space-y-4">
      {/* Invoice Number & Client */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={labelClassName}>Invoice Number</Label>
          <Input
            {...register("invoiceNumber")}
            className={cn(inputClassName, "font-mono")}
          />
          {errors.invoiceNumber && (
            <p className="text-xs text-destructive">{errors.invoiceNumber.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className={labelClassName}>Client *</Label>
          <ClientSelector
            clients={clients}
            value={clientId}
            onChange={(id) => setValue("clientId", id, { shouldValidate: true })}
            onAddNew={onAddNewClient}
            error={errors.clientId?.message}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={labelClassName}>Issue Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  inputClassName,
                  "w-full justify-start text-left font-normal border-0"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {issueDate ? format(issueDate, "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#111113] border-[#1e1e21]">
              <Calendar
                mode="single"
                selected={issueDate}
                onSelect={(date) => date && setValue("issueDate", date)}
                initialFocus
                className="bg-[#111113]"
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
                  "w-full justify-start text-left font-normal border-0"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {dueDate ? format(dueDate, "MMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#111113] border-[#1e1e21]">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && setValue("dueDate", date)}
                initialFocus
                className="bg-[#111113]"
              />
            </PopoverContent>
          </Popover>
          {errors.dueDate && (
            <p className="text-xs text-destructive">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      {/* Currency */}
      <div className="space-y-2">
        <Label className={labelClassName}>Currency</Label>
        <Select value={currency} onValueChange={(v) => setValue("currency", v as InvoiceFormData["currency"])}>
          <SelectTrigger className={inputClassName}>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent className="bg-[#111113] border-[#1e1e21] max-h-[300px]">
            {CURRENCIES.map((curr) => (
              <SelectItem 
                key={curr.code} 
                value={curr.code}
                className="hover:bg-[#1a1a1e]"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">{curr.code}</span>
                  <span>{curr.name}</span>
                  <span className="text-muted-foreground">{curr.symbol}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
