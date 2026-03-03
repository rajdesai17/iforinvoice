# iforinvoice MVP Implementation Plan

## Current State Summary
- **Framework**: Next.js 16.1.6 + React 19 + Tailwind 4 + shadcn/ui
- **Database**: NeonDB (project: `bold-bar-10496525`) with Drizzle ORM
- **Existing**: Landing page, dashboard layout, invoice builder (partial), clients/items/settings pages (partial), PDF generation with @react-pdf/renderer
- **Auth**: Better Auth installed but barely integrated — custom session lookup in `lib/auth/current-user.ts` with DEMO_USER_ID fallback
- **Schema**: Drizzle schema with users, sessions, accounts, verifications, businessProfiles, clients, items, invoices, invoiceLineItems

## Architecture Decisions
- **Auth**: Neon Auth (managed Better Auth) — replaces current incomplete setup
- **Storage**: Vercel Blob for logo/file uploads
- **Database**: NeonDB with Drizzle ORM (keep existing)
- **PDF**: @react-pdf/renderer (keep existing)
- **Deployment**: Vercel

---

## Phase 1: Auth — Neon Auth Integration

### 1.1 Provision Neon Auth
- Use `mcp__neon__provision_neon_auth` on project `bold-bar-10496525`
- Get the Auth URL and credentials

### 1.2 Install SDK & Configure Environment
- `npm install @neondatabase/auth@latest`
- Remove `better-auth` and `bcryptjs` packages
- Update `.env`:
  ```
  NEON_AUTH_BASE_URL=<from provisioning>
  NEON_AUTH_COOKIE_SECRET=<generate with openssl rand -base64 32>
  ```
- Remove old `BETTER_AUTH_SECRET` env var

### 1.3 Server Auth Setup
- Create `lib/auth/server.ts`:
  ```ts
  import { createNeonAuth } from '@neondatabase/auth/next/server';
  export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  });
  ```

### 1.4 Client Auth Setup
- Create `lib/auth/client.ts`:
  ```ts
  'use client';
  import { createAuthClient } from '@neondatabase/auth/next';
  export const authClient = createAuthClient();
  ```

### 1.5 API Route Handler
- Create `app/api/auth/[...path]/route.ts` with `auth.handler()`

### 1.6 Middleware
- Create `middleware.ts` (project root) to protect dashboard routes
- Redirect unauthenticated users to `/auth/sign-in`

### 1.7 Auth Pages
- Create `app/auth/[path]/page.tsx` using `<AuthView>` component
- This gives us: `/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out`, `/auth/forgot-password`

### 1.8 Update Current User Helper
- Rewrite `lib/auth/current-user.ts` to use `auth.getSession()` instead of manual cookie/session lookup
- `getCurrentUserId()` → calls `auth.getSession()`, returns `session?.user?.id`
- `requireCurrentUserId()` → same but throws if null
- Remove DEMO_USER_ID fallback

### 1.9 Update Layout
- Wrap root layout with `<NeonAuthUIProvider>`
- Add `<UserButton>` to navbar
- Import Neon Auth CSS in globals.css
- Update navbar sign-in/sign-up links to point to `/auth/sign-in` and `/auth/sign-up`

### 1.10 Schema Migration — User ID Mapping
- Neon Auth stores users in `neon_auth.user` schema
- Our business tables (businessProfiles, clients, items, invoices) reference `userId` as UUID
- Neon Auth user IDs are also UUIDs — **the FK relationship changes**: our `userId` columns now reference `neon_auth.user.id` instead of our own `users` table
- **Migration approach**: Drop old auth tables (users, sessions, accounts, verifications) from our schema since Neon Auth manages them. Keep business tables as-is, just update the Drizzle schema to remove auth table definitions.

---

## Phase 2: Database Schema Updates

### 2.1 Remove Old Auth Tables from Schema
- Remove `users`, `sessions`, `accounts`, `verifications` table definitions from `lib/db/schema.ts`
- Business tables keep `userId` column but no longer FK to our `users` table (Neon Auth manages the user table in `neon_auth` schema)

### 2.2 Add Invoice Activity Timeline Table
```sql
CREATE TABLE invoice_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,        -- 'created', 'updated', 'status_changed', 'duplicated', 'downloaded'
  details JSONB,               -- e.g. { "from": "draft", "to": "sent" }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_invoice_activities_invoice ON invoice_activities(invoice_id);
```

### 2.3 Add Payment Instructions to Business Profile
- Add `paymentInstructions` (TEXT) column to `businessProfiles`
- This stores default payment instructions (bank details, UPI, PayPal, etc.)

### 2.4 Add Payment Instructions to Invoices
- Add `paymentInstructions` (TEXT) column to `invoices`
- Inherited from business profile but overridable per invoice

### 2.5 Update Invoice Status Enum
- Change from: `draft, sent, viewed, paid, overdue, cancelled`
- Change to: `draft, sent, paid, void` (per MVP spec — manual only, no automation)

### 2.6 Add Smart Invoice Number Fields
- `businessProfiles` already has `invoicePrefix` and `nextInvoiceNumber`
- Add `invoiceNumberFormat` TEXT column — pattern like `{PREFIX}-{YYYY}-{NUM}` or `{PREFIX}{NUM}`
- Supported tokens: `{PREFIX}`, `{YYYY}`, `{YY}`, `{MM}`, `{NUM}`, `{NUM:4}` (zero-padded)

### 2.7 Run Migrations
- Use `drizzle-kit push` or `prepare_database_migration` MCP tool

---

## Phase 3: Onboarding Flow

### 3.1 Create Onboarding Page
- Route: `app/onboarding/page.tsx`
- Multi-step wizard (3 steps):
  1. **Business Info** — name, email, phone, address
  2. **Invoice Defaults** — prefix, number format, currency, payment terms, tax rate
  3. **Payment Instructions** — bank details, UPI, PayPal, etc. (optional, skip-able)
- Each step validates before proceeding
- Final step creates `businessProfile` record and redirects to `/dashboard`

### 3.2 Onboarding Guard
- In middleware or dashboard layout: check if user has a `businessProfile`
- If not → redirect to `/onboarding`
- After onboarding complete → never show again

---

## Phase 4: Business Profile & Settings

### 4.1 Settings Page — Business Profile Tab
- Edit business name, logo, address, tax ID, email, phone
- Logo upload via Vercel Blob (`@vercel/blob`)
- Install `@vercel/blob`, add `BLOB_READ_WRITE_TOKEN` env var

### 4.2 Settings Page — Invoice Defaults Tab
- Invoice prefix, number format, starting number
- Default currency, payment terms (days), default tax rate
- Default notes and footer text

### 4.3 Settings Page — Payment Instructions Tab
- Free-text payment instructions block
- Gets auto-populated on every new invoice

### 4.4 Settings Page — Account Tab
- User profile (name, email) — read from Neon Auth
- Link to Neon Auth account settings (`/account/settings`)

---

## Phase 5: Client Management

### 5.1 Client List Page
- Table with: name, company, email, total invoiced, outstanding amount
- Search/filter
- Archive toggle (show/hide archived)
- "Add Client" button opens drawer

### 5.2 Client Detail Page (Drawer or Page)
- Client info display/edit
- Invoice history for this client
- Total invoiced, outstanding, paid stats

### 5.3 Inline Add Client Drawer
- Slide-in drawer from invoice builder
- Create client without leaving the invoice page
- On save: auto-select the new client in the invoice form

### 5.4 Server Actions
- `createClient`, `updateClient`, `archiveClient`, `getClients`, `getClientById`, `getClientInvoiceHistory`

---

## Phase 6: Items Library

### 6.1 Items List Page
- Table with: name, description, rate, unit, taxable
- Search by name
- Add/edit/delete items

### 6.2 Server Actions
- `createItem`, `updateItem`, `deleteItem`, `getItems`, `searchItems`

---

## Phase 7: Invoice Builder (Core)

### 7.1 Invoice Form (Left Panel)
- Invoice number (auto-generated from smart format, editable)
- Issue date (default: today), due date (auto-calculated from payment terms)
- Client selector (searchable dropdown, with "Add New" option that opens drawer)
- Line items:
  - Searchable from items library (auto-fill on select)
  - Manual entry also supported
  - Drag to reorder
  - Quantity, unit price, amount (auto-calculated)
- Discount (percentage or fixed)
- Tax rate (default from settings, overridable)
- Payment instructions (default from settings, overridable)
- Notes and terms
- Auto-save as draft every 2 seconds (debounced)

### 7.2 Live Preview (Right Panel)
- Real-time PDF-like preview using existing `InvoicePreview` component
- Updates as user types

### 7.3 Invoice Actions Bar
- Save Draft
- Download PDF
- Mark as Sent / Mark as Paid / Mark as Void (status transitions)
- Duplicate Invoice (clone feature)

### 7.4 Smart Invoice Numbers
- On "New Invoice": generate number from format pattern + next number
- Example: `INV-2026-0001`, `INV-0042`, `2026/03/001`
- Auto-increment `nextInvoiceNumber` in business profile after invoice is finalized (moved from draft)
- Number is editable but warns if format doesn't match pattern

### 7.5 Auto-Save as Draft
- Debounced save (2 second delay after last change)
- Visual indicator: "Saving..." / "Saved" / "Unsaved changes"
- Uses `saveDraft` server action

---

## Phase 8: Invoice Management

### 8.1 Invoice List Page
- Table with: invoice number, client name, date, due date, amount, status
- Filter by status (draft, sent, paid, void)
- Search by invoice number or client name
- Quick actions: view, duplicate, download PDF, change status

### 8.2 Invoice Detail Page
- Full invoice view with live preview
- Status badge
- Action buttons based on current status:
  - Draft → Send, Delete
  - Sent → Paid, Void
  - Paid → Void (with confirmation)
  - Void → (no actions, record only)
- Activity timeline (sidebar or below)
- Download PDF button

### 8.3 Duplicate Invoice (Clone)
- Creates a new draft with all line items, client, notes copied
- New invoice number auto-generated
- Issue date = today, due date recalculated
- Status = draft
- Logs "Duplicated from INV-XXX" in activity timeline

### 8.4 Invoice Activity Timeline
- Shows chronological history:
  - "Invoice created" (with timestamp)
  - "Status changed from Draft to Sent"
  - "PDF downloaded"
  - "Duplicated from INV-XXX"
  - "Line items updated"
- Stored in `invoice_activities` table
- Displayed on invoice detail page

### 8.5 Status Transitions
- All manual, no automation
- Draft → Sent (mark as sent)
- Sent → Paid (mark as paid, record `paidAt` timestamp)
- Any → Void (cancel with confirmation)
- Each transition logs to activity timeline

---

## Phase 9: PDF Generation

### 9.1 PDF Template
- Uses existing `@react-pdf/renderer` setup
- Clean, professional layout:
  - Business logo + info (top left)
  - Client info (top right)
  - Invoice number, dates
  - Line items table
  - Subtotal, discount, tax, total
  - Payment instructions block (new)
  - Notes and terms (bottom)

### 9.2 PDF Download
- Server action generates PDF buffer
- Client downloads via blob URL
- Logs "PDF downloaded" to activity timeline

---

## Phase 10: Dashboard

### 10.1 Stat Cards
- Outstanding (sum of sent invoices)
- Collected This Month (sum of paid invoices this month)
- Paid All Time (sum of all paid invoices)
- Drafts Count (count of draft invoices)

### 10.2 Recent Invoices Table
- Last 10 invoices with: number, client, amount, status, date
- Quick actions: view, download PDF, change status

---

## Phase 11: Vercel Blob for Logo Upload

### 11.1 Setup
- Install `@vercel/blob`
- Add `BLOB_READ_WRITE_TOKEN` to env vars

### 11.2 Upload API Route
- `app/api/upload/route.ts` — handles multipart upload
- Validates file type (PNG, JPG, SVG) and size (< 2MB)
- Uploads to Vercel Blob, returns URL
- Stores URL in `businessProfiles.logoUrl`

### 11.3 Logo Display
- Show in invoice preview, PDF, and business profile settings

---

## Implementation Order (Recommended)

| Order | Phase | Est. Files | Dependencies |
|-------|-------|------------|-------------|
| 1 | Phase 1: Neon Auth | ~10 files | None |
| 2 | Phase 2: Schema Updates | ~3 files | Phase 1 |
| 3 | Phase 3: Onboarding | ~3 files | Phase 1, 2 |
| 4 | Phase 11: Vercel Blob | ~3 files | None |
| 5 | Phase 4: Settings | ~4 files | Phase 2, 3, 11 |
| 6 | Phase 5: Clients | ~5 files | Phase 1, 2 |
| 7 | Phase 6: Items | ~3 files | Phase 1, 2 |
| 8 | Phase 7: Invoice Builder | ~6 files | Phase 5, 6 |
| 9 | Phase 8: Invoice Management | ~5 files | Phase 7 |
| 10 | Phase 9: PDF | ~2 files | Phase 7 |
| 11 | Phase 10: Dashboard | ~2 files | Phase 8 |

---

## Differentiating Features Summary

1. **Smart Invoice Numbers** — Configurable format with tokens (`{PREFIX}-{YYYY}-{NUM:4}`), auto-increment, editable
2. **Duplicate Invoice (Clone)** — One-click clone of any invoice as new draft, with activity log
3. **Invoice Activity Timeline** — Full audit trail of every action on an invoice
4. **Payment Instructions Block** — Configurable default payment details (bank, UPI, PayPal) auto-populated on every invoice, overridable per invoice
