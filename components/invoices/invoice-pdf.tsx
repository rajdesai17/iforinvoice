import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

// Primary color matches --primary (#18181B)
const PRIMARY = "#18181B";
const GRAY_50 = "#F9FAFB";
const GRAY_100 = "#F3F4F6";
const GRAY_400 = "#9CA3AF";
const GRAY_500 = "#6B7280";
const GRAY_700 = "#374151";
const GRAY_900 = "#111827";
const GREEN_600 = "#16A34A";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: GRAY_900,
    backgroundColor: "#FFFFFF",
  },
  // Header
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: PRIMARY,
    fontFamily: "Courier-Bold",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  // Metadata row
  metadataRow: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 24,
  },
  metadataItem: {},
  metadataLabel: {
    fontSize: 8,
    color: GRAY_400,
    marginBottom: 3,
  },
  metadataValue: {
    fontSize: 10,
    color: GRAY_700,
    fontWeight: "bold",
  },
  metadataValueGreen: {
    fontSize: 10,
    color: GREEN_600,
    fontWeight: "bold",
  },
  // Billing cards
  billingRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  billingCard: {
    flex: 1,
    backgroundColor: GRAY_50,
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: GRAY_100,
  },
  billingCardTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: PRIMARY,
    marginBottom: 6,
  },
  billingCardName: {
    fontSize: 11,
    fontWeight: "bold",
    color: GRAY_900,
    marginBottom: 2,
  },
  billingCardText: {
    fontSize: 9,
    color: GRAY_500,
    marginTop: 3,
    lineHeight: 1.4,
  },
  // Table
  table: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  colItem: { flex: 5 },
  colQty: { flex: 2, textAlign: "center" },
  colPrice: { flex: 2, textAlign: "right" },
  colTotal: { flex: 3, textAlign: "right" },
  cellText: { fontSize: 9, color: GRAY_900 },
  cellTextMuted: { fontSize: 9, color: GRAY_500 },
  cellTextBold: { fontSize: 9, color: GRAY_900, fontWeight: "bold" },
  // Totals
  totalsContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: GRAY_500,
  },
  totalValue: {
    fontSize: 9,
    color: GRAY_900,
  },
  totalValueGreen: {
    fontSize: 9,
    color: GREEN_600,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: GRAY_900,
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: PRIMARY,
  },
  // Notes & Terms
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: GRAY_900,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: GRAY_500,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 8,
  },
});

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string | null;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date | null;
  currency?: string | null;
  subtotal: string | null;
  taxRate: string | null;
  taxAmount: string | null;
  discountAmount: string | null;
  total: string | null;
  notes: string | null;
  terms: string | null;
}

interface Client {
  name: string;
  company: string | null;
  email: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

interface LineItem {
  id: string;
  description: string;
  quantity: string | null;
  unitPrice: string | null;
  amount: string | null;
}

interface BusinessProfile {
  businessName: string | null;
  email: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
}

interface InvoicePDFProps {
  invoice: Invoice;
  client: Client | null;
  lineItems: LineItem[];
  profile: BusinessProfile | null;
}

function fmtCurrency(amount: string | number, currencyCode: string) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(isNaN(num) ? 0 : num);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(isNaN(num) ? 0 : num);
  }
}

export function InvoicePDF({ invoice, client, lineItems, profile }: InvoicePDFProps) {
  const currency = invoice.currency || "USD";
  const displayCompanyName = profile?.businessName || "Your Business";
  const displayCompanyAddress = [profile?.addressLine1, profile?.city, profile?.state, profile?.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Invoice Title */}
        <Text style={styles.invoiceTitle}>Invoice {invoice.invoiceNumber}</Text>

        {/* Metadata Row */}
        <View style={styles.metadataRow}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Serial Number</Text>
            <Text style={styles.metadataValue}>{invoice.invoiceNumber.replace("INV-", "")}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Issue Date</Text>
            <Text style={styles.metadataValue}>{format(new Date(invoice.issueDate), "dd/MM/yyyy")}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Due Date</Text>
            <Text style={styles.metadataValue}>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Currency</Text>
            <Text style={styles.metadataValue}>{currency}</Text>
          </View>
          {invoice.paidAt && (
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Paid</Text>
              <Text style={styles.metadataValueGreen}>{format(new Date(invoice.paidAt), "dd/MM/yyyy")}</Text>
            </View>
          )}
        </View>

        {/* Billing Cards */}
        <View style={styles.billingRow}>
          <View style={styles.billingCard}>
            <Text style={styles.billingCardTitle}>Billed By</Text>
            <Text style={styles.billingCardName}>{displayCompanyName}</Text>
            {profile?.email && <Text style={styles.billingCardText}>{profile.email}</Text>}
            {displayCompanyAddress && <Text style={styles.billingCardText}>{displayCompanyAddress}</Text>}
          </View>
          <View style={styles.billingCard}>
            <Text style={styles.billingCardTitle}>Billed To</Text>
            <Text style={styles.billingCardName}>{client?.company || client?.name || "Unknown"}</Text>
            {client?.company && client?.name && <Text style={styles.billingCardText}>{client.name}</Text>}
            {client?.email && <Text style={styles.billingCardText}>{client.email}</Text>}
            {(client?.addressLine1 || client?.city) && (
              <Text style={styles.billingCardText}>
                {[client?.addressLine1, client?.city, client?.state, client?.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colItem]}>Item</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>
          {lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colItem]}>{item.description}</Text>
              <Text style={[styles.cellTextMuted, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cellTextMuted, styles.colPrice]}>{fmtCurrency(item.unitPrice || 0, currency)}</Text>
              <Text style={[styles.cellTextBold, styles.colTotal]}>{fmtCurrency(item.amount || 0, currency)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{fmtCurrency(invoice.subtotal || 0, currency)}</Text>
            </View>
            {parseFloat(String(invoice.taxRate || 0)) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                <Text style={styles.totalValue}>{fmtCurrency(invoice.taxAmount || 0, currency)}</Text>
              </View>
            )}
            {parseFloat(String(invoice.discountAmount || 0)) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={styles.totalValueGreen}>-{fmtCurrency(invoice.discountAmount || 0, currency)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{fmtCurrency(invoice.total || 0, currency)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
        {invoice.terms && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Generated by iforinvoice</Text>
      </Page>
    </Document>
  );
}
