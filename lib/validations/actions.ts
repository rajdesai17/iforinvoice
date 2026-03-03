import { z } from "zod";
import { CURRENCY_CODES } from "@/lib/currencies";

const optionalText = z.string().trim().max(500).optional().default("");
const optionalLongText = z.string().trim().max(5000).optional().default("");

export const idSchema = z.string().uuid("Invalid identifier");

export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Client name is required").max(200),
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")).default(""),
  phone: optionalText,
  company: optionalText,
  addressLine1: optionalText,
  addressLine2: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText,
  country: optionalText,
  notes: optionalLongText,
});

export const itemInputSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(200),
  description: optionalLongText,
  rate: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Rate must be a valid amount with up to 2 decimals"),
  unit: z.enum(["hour", "day", "item", "project"]),
  isTaxable: z.boolean(),
});

export const profileInputSchema = z.object({
  businessName: optionalText,
  email: z.string().trim().email("Invalid email address").optional().or(z.literal("")).default(""),
  phone: optionalText,
  addressLine1: optionalText,
  addressLine2: optionalText,
  city: optionalText,
  state: optionalText,
  postalCode: optionalText,
  country: optionalText,
  taxId: optionalText,
  defaultCurrency: z.string().trim().max(3).default("USD"),
  defaultPaymentTerms: z.coerce.number().int().min(0).max(365).default(30),
  defaultTaxRate: z.coerce.number().min(0).max(100).default(0),
  invoicePrefix: z.string().trim().min(1).max(20).default("INV"),
  invoiceNumberFormat: z.string().trim().max(100).default("{PREFIX}-{YYYY}-{NUM:4}"),
  invoiceNotes: optionalLongText,
  invoiceFooter: optionalLongText,
  paymentInstructions: optionalLongText,
});

const lineItemInputSchema = z.object({
  description: z.string().trim().min(1, "Line item description is required").max(500),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative"),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
});

const createInvoiceInputBaseSchema = z.object({
  invoiceNumber: z.string().trim().min(1, "Invoice number is required").max(100),
  clientId: idSchema,
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  lineItems: z.array(lineItemInputSchema).min(1, "At least one line item is required"),
  taxRate: z.coerce.number().min(0).max(100),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(0),
  notes: optionalLongText,
  terms: optionalLongText,
  paymentInstructions: optionalLongText,
  currency: z.enum(CURRENCY_CODES),
  subtotal: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0),
  discountAmount: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
});

export const createInvoiceInputSchema = createInvoiceInputBaseSchema
  .extend({
    status: z.enum(["draft", "sent"]),
  })
  .refine((data) => data.dueDate >= data.issueDate, {
    message: "Due date must be on or after issue date",
    path: ["dueDate"],
  });

export const invoiceStatusSchema = z.enum([
  "draft",
  "sent",
  "paid",
  "void",
]);

const draftLineItemSchema = z.object({
  description: z.string().trim().optional().default(""),
  quantity: z.coerce.number().min(0).default(0),
  unitPrice: z.coerce.number().min(0).default(0),
  amount: z.coerce.number().min(0).default(0),
});

export const saveDraftInputSchema = z
  .object({
    invoiceNumber: z.string().trim().min(1, "Invoice number is required").max(100),
    clientId: idSchema,
    issueDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    lineItems: z.array(draftLineItemSchema).default([]),
    taxRate: z.coerce.number().min(0).max(100).default(0),
    discountType: z.enum(["percentage", "fixed"]).default("percentage"),
    discountValue: z.coerce.number().min(0).default(0),
    notes: optionalLongText,
    terms: optionalLongText,
    currency: z.enum(CURRENCY_CODES).default("USD"),
    subtotal: z.coerce.number().min(0).default(0),
    taxAmount: z.coerce.number().min(0).default(0),
    discountAmount: z.coerce.number().min(0).default(0),
    total: z.coerce.number().min(0).default(0),
  })
  .refine((data) => data.dueDate >= data.issueDate, {
    message: "Due date must be on or after issue date",
    path: ["dueDate"],
  });
