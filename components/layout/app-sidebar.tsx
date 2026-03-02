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
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#0a0a0b] border-r border-[#1e1e21] flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/invoices" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-lg text-white">iforinvoice</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {/* Main Navigation */}
        <p className="px-3 mb-2 text-[10px] font-medium text-[#6b7280]">
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
                      ? "text-white bg-[#1a1a1e]" 
                      : "text-[#9ca3af] hover:text-white hover:bg-[#1a1a1e]/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-[#9ca3af]" : "text-[#6b7280]"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Create Section */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-medium text-[#6b7280]">
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
                      ? "text-white bg-primary/20" 
                      : "text-[#9ca3af] hover:text-white hover:bg-[#1a1a1e]/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-primary" : "text-[#6b7280]"
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
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#9ca3af] hover:text-white transition-colors duration-150"
        >
          <Github className="h-4 w-4" />
          <span>Proudly Open Source</span>
        </a>

        {/* Login Card */}
        <div className="p-3 rounded-xl bg-[#111113] border border-[#1e1e21]">
          <p className="text-sm font-semibold text-white">Login</p>
          <p className="text-xs text-[#6b7280] mt-1 leading-relaxed">
            Login to your account to save your data and access your data anywhere
          </p>
          <Button 
            asChild
            size="sm" 
            className="mt-3 bg-primary hover:bg-primary/90 text-white text-xs h-7 px-3"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
