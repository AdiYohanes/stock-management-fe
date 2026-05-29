"use client";

import { Package, Send, FileText, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RecentActivity } from "@/lib/utils/dashboard-helpers";
import { getTransactionTypeLabel } from "@/lib/utils/dashboard-helpers";
import type { TransactionType } from "@/lib/constants/mock-transactions";

// --- Types ---

interface RecentActivityListProps {
  activities: RecentActivity[];
}

interface TransactionTypeConfig {
  icon: LucideIcon;
  iconClassName: string;
  badgeVariant: "default" | "secondary" | "warning" | "success";
  label: string;
}

// --- Configuration ---

const TRANSACTION_TYPE_CONFIG: Record<TransactionType, TransactionTypeConfig> =
  {
    GR: {
      icon: Package,
      iconClassName: "text-emerald-600",
      badgeVariant: "success",
      label: "Penerimaan",
    },
    GI: {
      icon: Send,
      iconClassName: "text-blue-600",
      badgeVariant: "default",
      label: "Pengeluaran",
    },
    ADJ: {
      icon: FileText,
      iconClassName: "text-amber-600",
      badgeVariant: "warning",
      label: "Penyesuaian",
    },
  };

// --- Activity Item Component ---

function ActivityItem({ activity }: { activity: RecentActivity }) {
  const config = TRANSACTION_TYPE_CONFIG[activity.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon
          className={`h-4 w-4 ${config.iconClassName}`}
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium truncate">
            {activity.referenceNumber}
          </span>
          <Badge
            variant={config.badgeVariant}
            className="text-[10px] px-1.5 py-0"
          >
            {getTransactionTypeLabel(activity.type)}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">
          {activity.description}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>{activity.relativeTime}</span>
          <span className="mx-1">·</span>
          <span>{activity.createdBy}</span>
        </div>
      </div>
    </div>
  );
}

// --- Main Export ---

/**
 * Recent Activity Timeline component.
 * Displays the 5 most recent transactions (GR/GI/ADJ) with relative timestamps.
 */
export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada aktivitas tercatat.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
