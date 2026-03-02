"use client";

import { Download, Loader2, Check, AlertCircle, AlertTriangle, Upload, SlidersHorizontal, ChevronDown, FileText, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

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
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      {/* Main Header Row */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Document icons */}
          <div className="flex items-center gap-1">
            <div className="w-7 h-7 rounded bg-secondary flex items-center justify-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <FilePlus className="h-4 w-4 text-white" />
            </div>
          </div>
          <h1 className="text-lg font-semibold">Create Invoice</h1>
          
          {/* Auto-save status indicator */}
          <AutoSaveIndicator status={autoSaveStatus} />
        </div>
        
        {/* Theme Toggle - right side of header */}
        <Switch className="data-[state=checked]:bg-primary" />
      </div>
      
      {/* Sub-Header / Toolbar Row */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-border">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-secondary hover:bg-secondary/80 text-secondary-foreground gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Errors
          </Button>
          
          <Button
            type="button"
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90 gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        </div>
        
        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-secondary hover:bg-secondary/80 gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {viewMode === "both" ? "Both" : viewMode === "form" ? "Form Only" : "Preview Only"}
                <ChevronDown className="h-4 w-4" />
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

          {/* Download Button */}
          <Button
            type="button"
            onClick={onDownloadPdf}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Download className="h-4 w-4" />
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
