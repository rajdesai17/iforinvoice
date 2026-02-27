"use client";

import Link from "next/link";
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
    <div className="rounded-xl bg-[#111113] border border-[#1e1e21] overflow-hidden">
      <div className="p-4 border-b border-[#1e1e21]">
        <h3 className="text-sm font-semibold text-primary">Quick Actions</h3>
        <p className="text-xs text-[#6b7280] mt-0.5">Common tasks to get you started</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-start gap-2 p-4 rounded-xl bg-[#1a1a1e] border border-transparent hover:border-[#2a2a30] transition-all duration-150"
            >
              <div className="p-2 rounded-lg bg-[#111113]">
                <action.icon className="h-4 w-4 text-[#6b7280]" />
              </div>
              <div>
                <span className="font-medium text-white text-sm">{action.title}</span>
                <p className="text-xs text-[#6b7280]">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
