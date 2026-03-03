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
import { ThemeToggle } from "@/components/theme-toggle";

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

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/invoices" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground">iforinvoice</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {/* Main Navigation */}
        <p className="px-3 mb-2 text-[10px] font-medium text-sidebar-accent-foreground">
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
                      ? "text-sidebar-foreground bg-sidebar-accent" 
                      : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-sidebar-accent-foreground" : "text-sidebar-accent-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Create Section */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-medium text-sidebar-accent-foreground">
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
                      ? "text-sidebar-foreground bg-primary/20" 
                      : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 transition-colors duration-150",
                    isActive ? "text-primary" : "text-sidebar-accent-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Open Source Badge */}
        <a 
          href="https://github.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-accent-foreground hover:text-sidebar-foreground transition-colors duration-150"
        >
          <Github className="h-4 w-4" />
          <span>Proudly Open Source</span>
        </a>

        {/* Login Card */}
        <div className="p-3 rounded-xl bg-sidebar-accent border border-sidebar-border">
          <p className="text-sm font-semibold text-sidebar-foreground">Login</p>
          <p className="text-xs text-sidebar-accent-foreground mt-1 leading-relaxed">
            Login to your account to save your data and access your data anywhere
          </p>
          <Button 
            asChild
            size="sm" 
            className="mt-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-7 px-3"
          >
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
