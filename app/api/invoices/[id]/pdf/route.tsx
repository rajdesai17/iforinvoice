import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, clients, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

// Demo user ID (no auth)
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = DEMO_USER_ID;

    // Get invoice data
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, invoice.clientId));

    const lineItems = await db
      .select()
      .from(invoiceLineItems)
      .where(eq(invoiceLineItems.invoiceId, id))
      .orderBy(invoiceLineItems.sortOrder);

    const [profile] = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, userId));

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      <InvoicePDF
        invoice={invoice}
        client={client}
        lineItems={lineItems}
        profile={profile}
      />
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
