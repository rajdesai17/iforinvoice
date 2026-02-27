"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      iconClass: "text-emerald-600 bg-emerald-100",
    },
    {
      title: "Outstanding",
      value: formatCurrency(stats.outstanding),
      description: `${stats.sentCount} pending invoices`,
      icon: Clock,
      iconClass: "text-blue-600 bg-blue-100",
    },
    {
      title: "Overdue",
      value: formatCurrency(stats.overdue),
      description: `${stats.overdueCount} overdue invoices`,
      icon: AlertTriangle,
      iconClass: "text-amber-600 bg-amber-100",
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
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.iconClass}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
