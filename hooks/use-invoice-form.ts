"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  invoiceFormSchema,
  type InvoiceFormData,
  getDefaultInvoiceValues,
  createEmptyLineItem,
  calculateLineItemAmount,
} from "@/lib/validations/invoice";

interface UseInvoiceFormOptions {
  invoiceNumber: string;
  defaultCurrency?: string;
  defaultPaymentTerms?: number;
  defaultNotes?: string;
  defaultTerms?: string;
}

export function useInvoiceForm({
  invoiceNumber,
  defaultCurrency = "USD",
  defaultPaymentTerms = 30,
  defaultNotes = "",
  defaultTerms = "",
}: UseInvoiceFormOptions) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      ...getDefaultInvoiceValues(invoiceNumber, defaultCurrency, defaultPaymentTerms),
      notes: defaultNotes,
      terms: defaultTerms,
    },
    mode: "onChange",
  });

  const { watch, setValue, getValues } = form;
  const lineItems = watch("lineItems");

  // Add a new line item
  const addLineItem = () => {
    const current = getValues("lineItems");
    setValue("lineItems", [...current, createEmptyLineItem()], { shouldDirty: true });
  };

  // Remove a line item by id
  const removeLineItem = (id: string) => {
    const current = getValues("lineItems");
    if (current.length > 1) {
      setValue(
        "lineItems",
        current.filter((item) => item.id !== id),
        { shouldDirty: true }
      );
    }
  };

  // Update a specific field of a line item
  const updateLineItem = (
    id: string,
    field: keyof InvoiceFormData["lineItems"][number],
    value: string | number
  ) => {
    const current = getValues("lineItems");
    const updated = current.map((item) => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        // Recalculate amount if quantity or unitPrice changed
        if (field === "quantity" || field === "unitPrice") {
          newItem.amount = calculateLineItemAmount(
            field === "quantity" ? (value as number) : newItem.quantity,
            field === "unitPrice" ? (value as number) : newItem.unitPrice
          );
        }
        return newItem;
      }
      return item;
    });
    setValue("lineItems", updated, { shouldDirty: true });
  };

  // Add line item from items library
  const addFromLibrary = (item: { name: string; description: string | null; rate: string }) => {
    const current = getValues("lineItems");
    const description = item.name + (item.description ? ` - ${item.description}` : "");
    const unitPrice = parseFloat(item.rate);
    const newItem = {
      id: crypto.randomUUID(),
      description,
      quantity: 1,
      unitPrice,
      amount: unitPrice,
    };
    setValue("lineItems", [...current, newItem], { shouldDirty: true });
  };

  // Reorder line items (for drag-drop)
  const reorderLineItems = (startIndex: number, endIndex: number) => {
    const current = [...getValues("lineItems")];
    const [removed] = current.splice(startIndex, 1);
    current.splice(endIndex, 0, removed);
    setValue("lineItems", current, { shouldDirty: true });
  };

  return {
    form,
    lineItems,
    addLineItem,
    removeLineItem,
    updateLineItem,
    addFromLibrary,
    reorderLineItems,
  };
}
