import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems, clients, businessProfiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await cookies(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get invoice data
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), eq(invoices.userId, session.user.id)));

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
      .where(eq(businessProfiles.userId, session.user.id));

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
