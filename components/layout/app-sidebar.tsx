"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  FolderOpen,
  FilePlus,
  Users,
  Settings,
  LayoutDashboard,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@neondatabase/auth/react/ui";

const mainNavigation = [
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
    title: "Items Library",
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

const bottomNavigation = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-background flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-sidebar-foreground tracking-tight">iforinvoice</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {/* Main Navigation */}
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-accent-foreground">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                    isActive
                      ? "text-sidebar-foreground bg-sidebar-accent font-medium"
                      : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-sidebar-accent-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Create Section */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-accent-foreground">
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
                      ? "text-primary bg-primary/10 font-medium"
                      : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 shrink-0",
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
      <div className="p-3 space-y-1">
        {/* Settings */}
        {bottomNavigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                isActive
                  ? "text-sidebar-foreground bg-sidebar-accent font-medium"
                  : "text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-primary" : "text-sidebar-accent-foreground"
              )} />
              <span>{item.title}</span>
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <ThemeToggle variant="sidebar" />

        {/* Open Source Badge */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-accent-foreground hover:text-sidebar-foreground transition-colors duration-150"
        >
          <Github className="h-4 w-4" />
          <span>Open Source</span>
        </a>

        {/* User Profile */}
        <div className="px-3 py-2 flex items-center gap-3">
          <UserButton />
        </div>
      </div>
    </aside>
  );
}
