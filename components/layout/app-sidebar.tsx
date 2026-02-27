"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  Plus,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Items",
    href: "/items",
    icon: Package,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#0a0a0b] border-r border-[#1e1e21] flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-white">InvoiceFlow</span>
        </Link>
      </div>

      {/* Create Button */}
      <div className="px-3 py-2">
        <Button asChild className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl h-10">
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
          Navigation
        </p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 relative",
                    isActive 
                      ? "text-white bg-[#1a1a1e]" 
                      : "text-[#9ca3af] hover:text-white hover:bg-[#1a1a1e]/50"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                  )}
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-white" : "text-[#6b7280]"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
          Settings
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150 relative",
                pathname.startsWith("/settings")
                  ? "text-white bg-[#1a1a1e]" 
                  : "text-[#9ca3af] hover:text-white hover:bg-[#1a1a1e]/50"
              )}
            >
              {pathname.startsWith("/settings") && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
              )}
              <Settings className={cn(
                "h-4 w-4 transition-colors duration-150",
                pathname.startsWith("/settings") ? "text-white" : "text-[#6b7280]"
              )} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-3">
        {/* GitHub Badge */}
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-xs text-[#6b7280] hover:text-white transition-colors duration-150"
        >
          <Github className="h-4 w-4" />
          <span>Open Source</span>
        </a>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-[#111113] border border-[#1e1e21]">
          <p className="text-sm font-medium text-white">Demo Mode</p>
          <p className="text-xs text-[#6b7280] mt-0.5">demo@invoiceflow.app</p>
        </div>
      </div>
    </aside>
  );
}
