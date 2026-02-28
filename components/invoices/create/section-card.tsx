"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SectionCard({
  title,
  children,
  defaultOpen = true,
}: SectionCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-secondary/50 transition-colors duration-150">
          <h3 className="text-sm font-semibold text-primary">{title}</h3>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-150",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <div className="h-px bg-border" />
        <CollapsibleContent>
          <div className="p-4 space-y-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
