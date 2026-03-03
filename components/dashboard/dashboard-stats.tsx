"use client";

import { DollarSign, Clock, TrendingUp, FileEdit } from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    outstanding: number;
    collectedThisMonth: number;
    totalInvoices: number;
    paidCount: number;
    sentCount: number;
    draftCount: number;
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

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statCards = [
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstanding),
      description: `${stats.sentCount} sent invoices`,
      icon: Clock,
      iconClass: "text-blue-400 bg-blue-400/10",
    },
    {
      title: "Collected This Month",
      value: formatCurrency(stats.collectedThisMonth),
      description: "Paid this month",
      icon: TrendingUp,
      iconClass: "text-emerald-400 bg-emerald-400/10",
    },
    {
      title: "Paid All Time",
      value: formatCurrency(stats.totalRevenue),
      description: `${stats.paidCount} paid invoices`,
      icon: DollarSign,
      iconClass: "text-amber-400 bg-amber-400/10",
    },
    {
      title: "Drafts",
      value: stats.draftCount.toString(),
      description: `${stats.totalInvoices} total invoices`,
      icon: FileEdit,
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
