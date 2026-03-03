'use server'

import { db } from '@/lib/db'
import { invoices, clients } from '@/lib/db/schema'
import { eq, and, sql, desc, gte } from 'drizzle-orm'
import type { DashboardStats, InvoiceWithRelations } from '@/lib/types'
import { requireCurrentUserId } from '@/lib/auth/current-user'

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await requireCurrentUserId()

  // Get total revenue (paid invoices)
  const revenueResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)::numeric` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), eq(invoices.status, 'paid')))

  // Get outstanding amount (sent invoices)
  const outstandingResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)::numeric` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), eq(invoices.status, 'sent')))

  // Get collected this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const collectedResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${invoices.total}), 0)::numeric` })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        eq(invoices.status, 'paid'),
        gte(invoices.paidAt, startOfMonth)
      )
    )

  // Get draft count
  const draftResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), eq(invoices.status, 'draft')))

  return {
    totalRevenue: Number(revenueResult[0]?.total) || 0,
    outstanding: Number(outstandingResult[0]?.total) || 0,
    collectedThisMonth: Number(collectedResult[0]?.total) || 0,
    draftCount: Number(draftResult[0]?.count) || 0,
  }
}

export async function getRecentInvoices(limit: number = 5): Promise<InvoiceWithRelations[]> {
  const userId = await requireCurrentUserId()

  const results = await db
    .select()
    .from(invoices)
    .innerJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.userId, userId))
    .orderBy(desc(invoices.createdAt))
    .limit(limit)

  return results.map((r) => ({
    ...r.invoices,
    client: r.clients,
    lineItems: [],
  }))
}

export async function getMonthlyRevenue(): Promise<{ month: string; revenue: number }[]> {
  const userId = await requireCurrentUserId()

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const results = await db.execute(sql`
    SELECT
      TO_CHAR(paid_at, 'Mon') as month,
      COALESCE(SUM(total), 0)::numeric as revenue
    FROM invoices
    WHERE user_id = ${userId}
      AND status = 'paid'
      AND paid_at >= ${sixMonthsAgo}
    GROUP BY TO_CHAR(paid_at, 'Mon'), DATE_TRUNC('month', paid_at)
    ORDER BY DATE_TRUNC('month', paid_at)
  `)

  return results.rows as { month: string; revenue: number }[]
}
