"use client";

import { Save, Send, Download, Loader2, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface InvoiceActionsBarProps {
  onSaveDraft: () => void;
  onSaveAndSend: () => void;
  onDownloadPdf: () => void;
  isSubmitting: boolean;
  autoSaveStatus: AutoSaveStatus;
  isDirty: boolean;
}

export function InvoiceActionsBar({
  onSaveDraft,
  onSaveAndSend,
  onDownloadPdf,
  isSubmitting,
  autoSaveStatus,
  isDirty,
}: InvoiceActionsBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-sm bg-primary" />
          <h1 className="text-lg font-semibold">New Invoice</h1>
          
          {/* Auto-save status indicator */}
          <AutoSaveIndicator status={autoSaveStatus} />
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDownloadPdf}
                  disabled={isSubmitting}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSubmitting || (!isDirty && autoSaveStatus !== "error")}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Draft
          </Button>

          <Button
            type="button"
            onClick={onSaveAndSend}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Create Invoice
          </Button>
        </div>
      </div>
    </header>
  );
}

function AutoSaveIndicator({ status }: { status: AutoSaveStatus }) {
  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full",
        status === "saving" && "bg-muted text-muted-foreground",
        status === "saved" && "bg-green-500/10 text-green-500",
        status === "error" && "bg-destructive/10 text-destructive"
      )}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3" />
          <span>Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>Save failed</span>
        </>
      )}
    </div>
  );
}
