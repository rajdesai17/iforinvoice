"use client";

import { formatDistanceToNow } from "date-fns";
import {
  FilePlus,
  Send,
  CheckCircle,
  XCircle,
  Download,
  Copy,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

interface InvoiceActivityTimelineProps {
  activities: Activity[];
}

const actionConfig: Record<
  string,
  { icon: typeof FilePlus; label: string; color: string }
> = {
  created: {
    icon: FilePlus,
    label: "Invoice created",
    color: "text-blue-500",
  },
  updated: {
    icon: Pencil,
    label: "Invoice updated",
    color: "text-muted-foreground",
  },
  status_changed: {
    icon: Send,
    label: "Status changed",
    color: "text-primary",
  },
  duplicated: {
    icon: Copy,
    label: "Duplicated",
    color: "text-amber-500",
  },
  downloaded: {
    icon: Download,
    label: "PDF downloaded",
    color: "text-emerald-500",
  },
};

function getStatusIcon(status: string) {
  switch (status) {
    case "sent":
      return Send;
    case "paid":
      return CheckCircle;
    case "void":
      return XCircle;
    default:
      return Send;
  }
}

function getActivityDescription(activity: Activity): string {
  const { action, details } = activity;

  if (action === "status_changed" && details) {
    const from = (details.from as string) || "unknown";
    const to = (details.to as string) || "unknown";
    return `Status changed from ${from} to ${to}`;
  }

  if (action === "duplicated" && details?.sourceInvoiceNumber) {
    return `Duplicated from ${details.sourceInvoiceNumber}`;
  }

  return actionConfig[action]?.label || action;
}

export function InvoiceActivityTimeline({
  activities,
}: InvoiceActivityTimelineProps) {
  if (activities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-foreground mb-3">Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const config = actionConfig[activity.action];
          let Icon = config?.icon || FilePlus;
          const color = config?.color || "text-muted-foreground";

          if (
            activity.action === "status_changed" &&
            activity.details?.to
          ) {
            Icon = getStatusIcon(activity.details.to as string);
          }

          return (
            <div key={activity.id} className="flex gap-3 items-start">
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full bg-secondary",
                    color,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-px h-full bg-border absolute top-7" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-3">
                <p className="text-sm text-foreground">
                  {getActivityDescription(activity)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
