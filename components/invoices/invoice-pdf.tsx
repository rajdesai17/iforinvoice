import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#09090B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6366F1",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#71717A",
    marginTop: 4,
  },
  companyInfo: {
    textAlign: "right",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  smallText: {
    fontSize: 9,
    color: "#71717A",
    marginBottom: 2,
  },
  section: {
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    flex: 1,
  },
  colRight: {
    flex: 1,
    textAlign: "right",
  },
  label: {
    fontSize: 9,
    color: "#A1A1AA",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 11,
    marginBottom: 2,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#18181B",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7",
  },
  tableColDescription: {
    flex: 3,
  },
  tableColQty: {
    flex: 1,
    textAlign: "right",
  },
  tableColPrice: {
    flex: 1,
    textAlign: "right",
  },
  tableColAmount: {
    flex: 1,
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FAFAFA",
    textTransform: "uppercase",
  },
  totals: {
    marginLeft: "auto",
    width: 200,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    color: "#71717A",
  },
  totalValue: {
    fontWeight: "bold",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
    paddingTop: 8,
    marginTop: 8,
  },
  grandTotalText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  grandTotalAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6366F1",
  },
  notes: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: "#71717A",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#A1A1AA",
    fontSize: 8,
  },
});

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string | null;
  issueDate: Date;
  dueDate: Date;
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

function formatCurrency(amount: string | number) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function InvoicePDF({ invoice, client, lineItems, profile }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {profile?.businessName || "Your Business"}
            </Text>
            {profile?.email && <Text style={styles.smallText}>{profile.email}</Text>}
            {profile?.addressLine1 && (
              <Text style={styles.smallText}>{profile.addressLine1}</Text>
            )}
            {(profile?.city || profile?.state) && (
              <Text style={styles.smallText}>
                {[profile?.city, profile?.state, profile?.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Billing Info */}
        <View style={[styles.section, styles.row]}>
          <View style={styles.col}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.value}>
              {client?.company || client?.name || "Unknown"}
            </Text>
            {client?.company && client?.name && (
              <Text style={styles.smallText}>{client.name}</Text>
            )}
            {client?.email && <Text style={styles.smallText}>{client.email}</Text>}
            {client?.addressLine1 && (
              <Text style={styles.smallText}>{client.addressLine1}</Text>
            )}
            {(client?.city || client?.state) && (
              <Text style={styles.smallText}>
                {[client?.city, client?.state, client?.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
          </View>
          <View style={styles.colRight}>
            <Text style={styles.label}>Issue Date</Text>
            <Text style={styles.value}>
              {format(new Date(invoice.issueDate), "MMM d, yyyy")}
            </Text>
            <Text style={[styles.label, { marginTop: 10 }]}>Due Date</Text>
            <Text style={styles.value}>
              {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableColDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableColQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.tableColPrice]}>Price</Text>
            <Text style={[styles.tableHeaderText, styles.tableColAmount]}>Amount</Text>
          </View>
          {lineItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableColDescription}>{item.description}</Text>
              <Text style={styles.tableColQty}>{item.quantity}</Text>
              <Text style={styles.tableColPrice}>{formatCurrency(item.unitPrice || 0)}</Text>
              <Text style={styles.tableColAmount}>{formatCurrency(item.amount || 0)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal || 0)}</Text>
          </View>
          {parseFloat(String(invoice.taxRate || 0)) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.taxAmount || 0)}</Text>
            </View>
          )}
          {parseFloat(String(invoice.discountAmount || 0)) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(invoice.discountAmount || 0)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalText}>Total</Text>
            <Text style={styles.grandTotalAmount}>{formatCurrency(invoice.total || 0)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.terms && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by iforinvoice
        </Text>
      </Page>
    </Document>
  );
}
