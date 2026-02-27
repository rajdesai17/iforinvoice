"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UserPlus, Package, Settings } from "lucide-react";

const actions = [
  {
    title: "New Invoice",
    description: "Create a new invoice",
    href: "/invoices/new",
    icon: FileText,
  },
  {
    title: "Add Client",
    description: "Add a new client",
    href: "/clients?new=true",
    icon: UserPlus,
  },
  {
    title: "Add Item",
    description: "Add to your library",
    href: "/items?new=true",
    icon: Package,
  },
  {
    title: "Settings",
    description: "Configure your profile",
    href: "/settings",
    icon: Settings,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks to get you started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto flex-col items-start gap-1 p-4"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-5 w-5 mb-1 text-muted-foreground" />
                <span className="font-medium">{action.title}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {action.description}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
