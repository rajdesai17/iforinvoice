import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";

export const metadata = {
  title: "Dashboard",
};

async function getDashboardData(userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get invoice stats
  const [stats] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0)`,
      outstanding: sql<string>`COALESCE(SUM(CASE WHEN status IN ('sent', 'viewed') THEN total ELSE 0 END), 0)`,
      overdue: sql<string>`COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0)`,
      totalInvoices: sql<number>`COUNT(*)`,
      paidCount: sql<number>`COUNT(CASE WHEN status = 'paid' THEN 1 END)`,
      sentCount: sql<number>`COUNT(CASE WHEN status = 'sent' THEN 1 END)`,
      overdueCount: sql<number>`COUNT(CASE WHEN status = 'overdue' THEN 1 END)`,
    })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  // Get recent invoices
  const recentInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      total: invoices.total,
      dueDate: invoices.dueDate,
      clientName: clients.name,
      clientCompany: clients.company,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(eq(invoices.userId, userId))
    .orderBy(sql`${invoices.createdAt} DESC`)
    .limit(5);

  // Get monthly revenue for chart (last 6 months)
  const monthlyRevenue = await db
    .select({
      month: sql<string>`TO_CHAR(paid_at, 'Mon')`,
      monthNum: sql<number>`EXTRACT(MONTH FROM paid_at)`,
      revenue: sql<string>`COALESCE(SUM(total), 0)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.userId, userId),
        eq(invoices.status, "paid"),
        gte(invoices.paidAt, startOfYear)
      )
    )
    .groupBy(sql`TO_CHAR(paid_at, 'Mon'), EXTRACT(MONTH FROM paid_at)`)
    .orderBy(sql`EXTRACT(MONTH FROM paid_at)`);

  // Get client count
  const [clientCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(clients)
    .where(and(eq(clients.userId, userId), eq(clients.isArchived, false)));

  return {
    stats: {
      totalRevenue: parseFloat(stats?.totalRevenue || "0"),
      outstanding: parseFloat(stats?.outstanding || "0"),
      overdue: parseFloat(stats?.overdue || "0"),
      totalInvoices: stats?.totalInvoices || 0,
      paidCount: stats?.paidCount || 0,
      sentCount: stats?.sentCount || 0,
      overdueCount: stats?.overdueCount || 0,
    },
    recentInvoices,
    monthlyRevenue,
    clientCount: clientCount?.count || 0,
  };
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const data = await getDashboardData(session.user.id);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here{"'"}s an overview of your invoicing activity.
        </p>
      </div>

      <DashboardStats stats={data.stats} clientCount={data.clientCount} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={data.monthlyRevenue} />
        <QuickActions />
      </div>

      <RecentInvoices invoices={data.recentInvoices} />
    </div>
  );
}
