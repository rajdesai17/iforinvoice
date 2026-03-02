"use client";

import { DollarSign, Clock, AlertTriangle, Users } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    outstanding: number;
    overdue: number;
    totalInvoices: number;
    paidCount: number;
    sentCount: number;
    overdueCount: number;
  };
  clientCount: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardStats({ stats, clientCount }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: `${stats.paidCount} paid invoices`,
      icon: DollarSign,
      iconClass: "text-emerald-400 bg-emerald-400/10",
    },
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstanding),
      description: `${stats.sentCount} pending invoices`,
      icon: Clock,
      iconClass: "text-blue-400 bg-blue-400/10",
    },
    {
      title: "Overdue",
      value: formatCurrency(stats.overdue),
      description: `${stats.overdueCount} overdue invoices`,
      icon: AlertTriangle,
      iconClass: "text-amber-400 bg-amber-400/10",
    },
    {
      title: "Active Clients",
      value: clientCount.toString(),
      description: `${stats.totalInvoices} total invoices`,
      icon: Users,
      iconClass: "text-primary bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {stat.title}
            </span>
            <div className={`p-2 rounded-lg ${stat.iconClass}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}
