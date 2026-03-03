# InvoiceFlow

A modern, open-source invoicing application built with Next.js 16, designed for freelancers and small businesses to create, manage, and track invoices effortlessly.

## Features

### Dashboard
- **Revenue Overview** - Track total revenue, outstanding payments, and overdue amounts
- **Monthly Revenue Chart** - Visual representation of earnings over time
- **Recent Invoices** - Quick access to your latest invoices
- **Quick Actions** - One-click access to common tasks

### Invoice Management
- **Create Invoices** - Build professional invoices with a live preview
- **Invoice Builder** - Intuitive form with real-time preview panel
- **Status Tracking** - Track invoice status (Draft, Sent, Viewed, Paid, Overdue, Cancelled)
- **PDF Export** - Generate and download invoices as PDF documents
- **Tax & Discounts** - Apply tax rates and discounts (percentage or fixed)

### Client Management
- **Client Directory** - Store and manage client information
- **Contact Details** - Full address, email, and phone storage
- **Client Notes** - Add internal notes for each client
- **Archive Clients** - Keep records organized without deletion

### Items/Services Catalog
- **Saved Items** - Create reusable line items for quick invoicing
- **Custom Rates** - Set hourly, daily, per-item, or project-based pricing
- **Tax Settings** - Mark items as taxable or non-taxable

### Settings
- **Business Profile** - Configure your business name, logo, and contact info
- **Invoice Defaults** - Set default currency, payment terms, and invoice prefix
- **Invoice Numbering** - Automatic sequential invoice number generation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Neon Serverless
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (ready for integration)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **PDF Generation**: @react-pdf/renderer
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: SWR

## Database Schema

### Core Tables
- `users` - User accounts with email verification
- `business_profiles` - Business information and invoice settings
- `clients` - Client contact and billing information
- `items` - Reusable products/services catalog
- `invoices` - Invoice records with status tracking
- `invoice_line_items` - Individual line items per invoice

### Supporting Tables
- `sessions` - User session management
- `accounts` - OAuth provider connections
- `verifications` - Email verification tokens

## Project Structure

```
app/
├── (dashboard)/
│   ├── dashboard/       # Main dashboard with stats
│   ├── invoices/        # Invoice listing and creation
│   │   ├── new/         # New invoice builder
│   │   └── [id]/        # Invoice details/edit
│   ├── clients/         # Client management
│   ├── items/           # Items/services catalog
│   └── settings/        # Business profile settings
├── api/
│   └── invoices/[id]/pdf/  # PDF generation endpoint
└── page.tsx             # Landing/redirect page

components/
├── dashboard/           # Dashboard widgets
├── invoices/            # Invoice components
├── clients/             # Client components
├── items/               # Item components
├── settings/            # Settings forms
├── layout/              # App sidebar and layout
└── ui/                  # shadcn/ui components

lib/
├── db/
│   ├── index.ts         # Database connection
│   └── schema.ts        # Drizzle schema definitions
└── utils.ts             # Utility functions
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```powershell
git clone https://github.com/rajdesai17/iforinvoice.git
cd iforinvoice
```

2. Install dependencies:
```powershell
pnpm install
```

3. Set up environment variables:
```powershell
Copy-Item .env.example .env
```

Required environment variables:
```env
DATABASE_URL=your_neon_database_url
BETTER_AUTH_SECRET=your_strong_secret
BETTER_AUTH_URL=http://localhost:3000
DEMO_USER_ID=00000000-0000-0000-0000-000000000001
```

Notes:
- `DEMO_USER_ID` is a local-development fallback when no session token is present.
- Remove `DEMO_USER_ID` in production to enforce session-based access.

4. Run database migrations:
```powershell
pnpm drizzle-kit push
```

5. Start the development server:
```powershell
pnpm dev
```

## Demo Mode

The app currently runs in demo mode with a pre-seeded user account. This allows you to explore all features without authentication setup.

## Roadmap

- [ ] Full authentication implementation
- [ ] Email invoice delivery
- [ ] Payment gateway integration (Stripe)
- [ ] Recurring invoices
- [ ] Multi-currency support
- [ ] Invoice templates/themes
- [ ] Client portal
- [ ] Expense tracking
- [ ] Reports and analytics export

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

```
MIT License

Copyright (c) 2024 Raj Desai

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Developed by Raj
