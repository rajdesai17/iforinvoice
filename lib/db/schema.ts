import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  decimal,
  integer,
  pgEnum,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "void",
]);

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

export const itemUnitEnum = pgEnum("item_unit", ["hour", "day", "item", "project"]);

// ─── Business Profiles ───────────────────────────────────

export const businessProfiles = pgTable("business_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  businessName: text("business_name"),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  logoUrl: text("logo_url"),
  taxId: text("tax_id"),
  defaultCurrency: text("default_currency").default("USD"),
  defaultPaymentTerms: integer("default_payment_terms").default(30),
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }).default("0"),
  invoicePrefix: text("invoice_prefix").default("INV"),
  invoiceNumberFormat: text("invoice_number_format").default("{PREFIX}-{YYYY}-{NUM:4}"),
  nextInvoiceNumber: integer("next_invoice_number").default(1),
  invoiceNotes: text("invoice_notes"),
  invoiceFooter: text("invoice_footer"),
  paymentInstructions: text("payment_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Clients ─────────────────────────────────────────────

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  taxId: text("tax_id"),
  notes: text("notes"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Items Library ───────────────────────────────────────

export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  rate: decimal("rate", { precision: 12, scale: 2 }).notNull(),
  unit: itemUnitEnum("unit").default("hour"),
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 2 }),
  isTaxable: boolean("is_taxable").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Invoices ────────────────────────────────────────────

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "restrict" }),
  invoiceNumber: text("invoice_number").notNull(),
  status: invoiceStatusEnum("status").default("draft"),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  currency: text("currency").default("USD"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountType: discountTypeEnum("discount_type").default("percentage"),
  discountValue: decimal("discount_value", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  terms: text("terms"),
  paymentInstructions: text("payment_instructions"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Invoice Line Items ──────────────────────────────────

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Invoice Activities (Timeline) ──────────────────────

export const invoiceActivities = pgTable(
  "invoice_activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    action: text("action").notNull(), // 'created', 'updated', 'status_changed', 'duplicated', 'downloaded'
    details: jsonb("details"), // e.g. { "from": "draft", "to": "sent" }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_invoice_activities_invoice").on(table.invoiceId),
  ],
);

// ─── Relations ───────────────────────────────────────────

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
}));

export const itemsRelations = relations(items, ({}) => ({}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  lineItems: many(invoiceLineItems),
  activities: many(invoiceActivities),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceActivitiesRelations = relations(invoiceActivities, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceActivities.invoiceId],
    references: [invoices.id],
  }),
}));

// ─── Types ───────────────────────────────────────────────

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type NewBusinessProfile = typeof businessProfiles.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type NewInvoiceLineItem = typeof invoiceLineItems.$inferInsert;
export type InvoiceActivity = typeof invoiceActivities.$inferSelect;
export type NewInvoiceActivity = typeof invoiceActivities.$inferInsert;
