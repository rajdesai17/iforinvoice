"use client";

import { Download, Loader2, Check, AlertCircle, AlertTriangle, SlidersHorizontal, ChevronDown, FileText, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";
type ViewMode = "both" | "form" | "preview";

interface InvoiceActionsBarProps {
  onSaveDraft: () => void;
  onSaveAndSend: () => void;
  onDownloadPdf: () => void;
  isSubmitting: boolean;
  autoSaveStatus: AutoSaveStatus;
  isDirty: boolean;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export function InvoiceActionsBar({
  onSaveDraft,
  onSaveAndSend,
  onDownloadPdf,
  isSubmitting,
  autoSaveStatus,
  isDirty,
  viewMode = "both",
  onViewModeChange,
}: InvoiceActionsBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border shrink-0">
      <div className="flex h-12 items-center justify-between px-4 gap-2">
        {/* Left: Title + Auto-save */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <FilePlus className="h-4 w-4 text-white" />
            </div>
          </div>
          <h1 className="text-sm font-semibold">Create Invoice</h1>
          <AutoSaveIndicator status={autoSaveStatus} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-1.5"
            disabled
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Errors
          </Button>

          {/* View Mode Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {viewMode === "both" ? "Both" : viewMode === "form" ? "Form" : "Preview"}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewModeChange?.("both")}>
                Both
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewModeChange?.("form")}>
                Form Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewModeChange?.("preview")}>
                Preview Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onSaveDraft}
            disabled={isSubmitting || !isDirty}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Save Draft
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSaveAndSend}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FilePlus className="h-3.5 w-3.5" />
            )}
            Save & Send
          </Button>

          {/* Download Button */}
          <Button
            type="button"
            onClick={onDownloadPdf}
            disabled={isSubmitting}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download
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
