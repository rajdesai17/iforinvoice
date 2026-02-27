'use server'

import { db } from '@/lib/db'
import { invoices, clients } from '@/lib/db/schema'
import { eq, and, sql, desc, gte } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import type { DashboardStats, InvoiceWithRelations } from '@/lib/types'

async function getSession() {
  return await auth.api.getSession({
    headers: await headers(),
  })
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await getSession()
  if (!session?.user?.id) {
    return { totalRevenue: 0, outstanding: 0, invoicesSent: 0, overdueCount: 0 }
  }

  const userId = session.user.id

  // Get total revenue (paid invoices)
  const revenueResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)::numeric` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), eq(invoices.status, 'paid')))

  // Get outstanding amount (sent + viewed + overdue)
  const outstandingResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)::numeric` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        sql`${invoices.status} IN ('sent', 'viewed', 'overdue')`
      )
    )

  // Get invoices sent this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const sentResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        sql`${invoices.status} != 'draft'`,
        gte(invoices.createdAt, startOfMonth)
      )
    )

  // Get overdue count
  const overdueResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), eq(invoices.status, 'overdue')))

  return {
    totalRevenue: Number(revenueResult[0]?.total) || 0,
    outstanding: Number(outstandingResult[0]?.total) || 0,
    invoicesSent: Number(sentResult[0]?.count) || 0,
    overdueCount: Number(overdueResult[0]?.count) || 0,
  }
}

export async function getRecentInvoices(limit: number = 5): Promise<InvoiceWithRelations[]> {
  const session = await getSession()
  if (!session?.user?.id) return []

  const results = await db
    .select()
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.userId, session.user.id))
    .orderBy(desc(invoices.createdAt))
    .limit(limit)

  return results.map((r) => ({
    ...r.invoices,
    client: r.clients,
    lineItems: [],
  }))
}

export async function getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
  const session = await getSession()
  if (!session?.user?.id) return []

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const results = await db.execute(sql`
    SELECT 
      TO_CHAR(paid_at, 'Mon') as month,
      COALESCE(SUM(total), 0)::numeric as revenue
    FROM invoices
    WHERE user_id = ${session.user.id}
      AND status = 'paid'
      AND paid_at >= ${sixMonthsAgo}
    GROUP BY TO_CHAR(paid_at, 'Mon'), DATE_TRUNC('month', paid_at)
    ORDER BY DATE_TRUNC('month', paid_at)
  `)

  return results.rows as { month: string; revenue: number }[]
}
