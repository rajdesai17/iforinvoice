"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";
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
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-secondary/20 transition-colors duration-150">
          <h3 className="text-sm font-medium text-primary">{title}</h3>
          <ChevronUp
            className={cn(
              "h-4 w-4 text-primary transition-transform duration-200",
              !isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
