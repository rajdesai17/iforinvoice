"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  FilePlus,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const mainNavigation = [
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Manage Assets",
    href: "/items",
    icon: FolderOpen,
  },
];

const createNavigation = [
  {
    title: "Create Invoice",
    href: "/invoices/new",
    icon: FilePlus,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isCreateInvoice = pathname === "/invoices/new";

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/invoices" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-door">
            <FileText className="h-4 w-4 text-navy-alice" />
          </div>
          <span className="font-semibold text-lg text-navy-alice">iforinvoice</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {/* Main Navigation */}
        <p className="px-3 mb-2 text-[10px] font-medium text-navy-harper">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/invoices" && pathname.startsWith(item.href)) ||
              (item.href === "/invoices" && pathname === "/invoices");
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                    isActive 
                      ? "text-navy-alice bg-navy-true" 
                      : "text-navy-harper hover:text-navy-alice hover:bg-navy-true/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-navy-harper" : "text-navy-door"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Create Section */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-medium text-navy-harper">
          Create
        </p>
        <ul className="space-y-0.5">
          {createNavigation.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                    isActive 
                      ? "text-navy-alice bg-navy-door/20" 
                      : "text-navy-harper hover:text-navy-alice hover:bg-navy-true/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-navy-door" : "text-navy-door"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-4">
        {/* Open Source Badge */}
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 text-sm text-navy-harper hover:text-navy-alice transition-colors duration-150"
        >
          <Github className="h-4 w-4" />
          <span>Proudly Open Source</span>
        </a>

        {/* Login Card */}
        <div className="p-3 rounded-xl bg-navy-true border border-border">
          <p className="text-sm font-semibold text-navy-alice">Login</p>
          <p className="text-xs text-navy-harper mt-1 leading-relaxed">
            Login to your account to save your data and access your data anywhere
          </p>
          <Button 
            asChild
            size="sm" 
            className="mt-3 bg-navy-door hover:bg-navy-door/90 text-navy-alice text-xs h-7 px-3"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
