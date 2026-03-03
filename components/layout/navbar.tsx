"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderOpen, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { title: "Invoices", href: "/invoices", icon: FileText },
  { title: "Assets", href: "/items", icon: FolderOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">iforinvoice</span>
        </Link>

        {/* Nav Links — only on dashboard pages */}
        {!isLanding && (
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/invoices" && pathname.startsWith(link.href)) ||
                (link.href === "/invoices" && pathname.startsWith("/invoices") && !pathname.startsWith("/invoices/new"));

              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 text-sm",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.title}
                  </Button>
                </Link>
              );
            })}

            {/* Create Invoice — highlighted CTA */}
            <Link href="/invoices/new">
              <Button
                size="sm"
                className={cn(
                  "gap-2 text-sm ml-1",
                  pathname === "/invoices/new"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/90 hover:bg-primary text-primary-foreground"
                )}
              >
                <FilePlus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          </div>
        )}

        {/* Right side: theme toggle + sign in */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
