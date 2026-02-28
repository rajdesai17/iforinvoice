"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs (unless specifically allowed)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrlKey || shortcut.metaKey;
        const modifierMatch =
          (ctrlOrMeta ? event.ctrlKey || event.metaKey : true) &&
          (shortcut.shiftKey ? event.shiftKey : !event.shiftKey);

        if (event.key.toLowerCase() === shortcut.key.toLowerCase() && modifierMatch) {
          // For Ctrl/Cmd shortcuts, always trigger (even in inputs)
          // For other shortcuts, only trigger if not in an input
          if (ctrlOrMeta || !isInput) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcut helpers
export const INVOICE_SHORTCUTS = {
  save: { key: "s", ctrlKey: true, description: "Save draft" },
  send: { key: "Enter", ctrlKey: true, description: "Save and send" },
  addItem: { key: "n", ctrlKey: true, description: "Add line item" },
  preview: { key: "p", ctrlKey: true, description: "Toggle preview" },
} as const;
