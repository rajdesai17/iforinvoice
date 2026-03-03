export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    void: 'bg-muted text-muted-foreground line-through',
  }
  return colors[status] || colors.draft
}

/**
 * Generate an invoice number from a format pattern.
 *
 * Supported tokens:
 *   {PREFIX}  — the invoice prefix (e.g. "INV")
 *   {YYYY}   — four-digit year
 *   {YY}     — two-digit year
 *   {MM}     — zero-padded month
 *   {NUM}    — next number (no padding)
 *   {NUM:N}  — next number zero-padded to N digits (e.g. {NUM:4} → 0001)
 *
 * Examples:
 *   "{PREFIX}-{YYYY}-{NUM:4}" + prefix="INV", num=1  → "INV-2026-0001"
 *   "{PREFIX}{NUM:3}"         + prefix="F",   num=42 → "F042"
 *   "{YYYY}/{MM}/{NUM:3}"    + prefix="",     num=7  → "2026/03/007"
 */
export function generateInvoiceNumber(
  format: string,
  prefix: string,
  nextNumber: number,
  date: Date = new Date()
): string {
  const yyyy = date.getFullYear().toString()
  const yy = yyyy.slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')

  let result = format
  result = result.replace(/\{PREFIX\}/g, prefix)
  result = result.replace(/\{YYYY\}/g, yyyy)
  result = result.replace(/\{YY\}/g, yy)
  result = result.replace(/\{MM\}/g, mm)
  result = result.replace(/\{NUM:(\d+)\}/g, (_match, digits) =>
    String(nextNumber).padStart(parseInt(digits, 10), '0')
  )
  result = result.replace(/\{NUM\}/g, String(nextNumber))

  return result
}

/** Backwards-compatible simple generator */
export function generateSimpleInvoiceNumber(prefix: string, nextNumber: number): string {
  return generateInvoiceNumber('{PREFIX}-{YYYY}-{NUM:4}', prefix, nextNumber)
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function calculateInvoiceTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  taxRate: number = 0,
  discountType: 'percentage' | 'fixed' = 'percentage',
  discountValue: number = 0
): {
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
} {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  
  const discountAmount =
    discountType === 'percentage'
      ? (subtotal * discountValue) / 100
      : discountValue
  
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}
