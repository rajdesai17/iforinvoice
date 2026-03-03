"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  variant?: "icon" | "sidebar";
}

export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  const isDark = resolvedTheme === "dark";

  if (!mounted) {
    if (variant === "sidebar") {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 px-3 py-2 text-sm text-sidebar-accent-foreground"
        >
          <Sun className="h-4 w-4" />
          <span>Theme</span>
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === "sidebar") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="w-full justify-start gap-3 px-3 py-2 text-sm text-sidebar-accent-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-150"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 text-muted-foreground hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">{isDark ? "Switch to light mode" : "Switch to dark mode"}</span>
    </Button>
  );
}
