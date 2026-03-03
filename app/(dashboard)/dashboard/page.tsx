import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, sql, and, gte } from "drizzle-orm";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardUnavailable } from "@/components/dashboard/dashboard-unavailable";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { requireCurrentUserId } from "@/lib/auth/current-user";

export const metadata = {
  title: "Dashboard",
};

async function getDashboardData(userId: string) {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  // Get invoice stats
  const [stats] = await db
    .select({
      totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0)`,
      outstanding: sql<string>`COALESCE(SUM(CASE WHEN status = 'sent' THEN total ELSE 0 END), 0)`,
      collectedThisMonth: sql<string>`COALESCE(SUM(CASE WHEN status = 'paid' AND paid_at >= date_trunc('month', CURRENT_DATE) THEN total ELSE 0 END), 0)`,
      totalInvoices: sql<number>`COUNT(*)`,
      paidCount: sql<number>`COUNT(CASE WHEN status = 'paid' THEN 1 END)`,
      sentCount: sql<number>`COUNT(CASE WHEN status = 'sent' THEN 1 END)`,
      draftCount: sql<number>`COUNT(CASE WHEN status = 'draft' THEN 1 END)`,
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
      collectedThisMonth: parseFloat(stats?.collectedThisMonth || "0"),
      totalInvoices: stats?.totalInvoices || 0,
      paidCount: stats?.paidCount || 0,
      sentCount: stats?.sentCount || 0,
      draftCount: stats?.draftCount || 0,
    },
    recentInvoices,
    monthlyRevenue,
    clientCount: clientCount?.count || 0,
  };
}

function isDbConnectionError(err: unknown): boolean {
  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "NeonDbError") return true;
  const cause = err && typeof err === "object" && "cause" in err ? (err as { cause: unknown }).cause : null;
  if (cause && typeof cause === "object" && "code" in cause && (cause as { code: string }).code === "ETIMEDOUT") return true;
  return false;
}

export default async function DashboardPage() {
  const userId = await requireCurrentUserId();
  let data;
  try {
    data = await getDashboardData(userId);
  } catch (err) {
    if (isDbConnectionError(err)) {
      return <DashboardUnavailable />;
    }
    throw err;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-sm bg-primary" />
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here{"'"}s an overview of your invoicing activity.
          </p>
        </div>
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
