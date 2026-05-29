"use client";

import Link from "next/link";
import { Package, AlertTriangle, ArrowRightLeft, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import type { DashboardSummary } from "@/lib/utils/dashboard-aggregates";

// --- Types ---

interface WidgetConfig {
  title: string;
  icon: LucideIcon;
  href: string;
  iconClassName: string;
}

interface SummaryWidgetsProps {
  summary: DashboardSummary;
}

// --- Widget Configurations ---

const WIDGET_CONFIGS: Record<keyof DashboardSummary, WidgetConfig> = {
  totalProduct: {
    title: "Total Produk",
    icon: Package,
    href: "/dashboard/inventory",
    iconClassName: "text-blue-600",
  },
  lowStock: {
    title: "Stok Rendah",
    icon: AlertTriangle,
    href: "/dashboard/inventory?stockStatus=low",
    iconClassName: "text-amber-600",
  },
  todayTransaction: {
    title: "Transaksi Hari Ini",
    icon: ArrowRightLeft,
    href: "/dashboard/receiving",
    iconClassName: "text-emerald-600",
  },
  activeUser: {
    title: "User Aktif",
    icon: Users,
    href: "/dashboard/users",
    iconClassName: "text-violet-600",
  },
};

// --- Individual Widget Components ---

function TotalProductWidget({ summary }: { summary: DashboardSummary }) {
  const config = WIDGET_CONFIGS.totalProduct;
  const Icon = config.icon;

  return (
    <Link href={config.href} className="group block">
      <Card className="transition-shadow duration-200 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.title}
          </CardTitle>
          <Icon
            className={`h-5 w-5 ${config.iconClassName}`}
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(summary.totalProduct.totalSku)} SKU
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Nilai inventaris: {formatCurrency(summary.totalProduct.totalValue)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function LowStockWidget({ summary }: { summary: DashboardSummary }) {
  const config = WIDGET_CONFIGS.lowStock;
  const Icon = config.icon;

  return (
    <Link href={config.href} className="group block">
      <Card className="transition-shadow duration-200 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.title}
          </CardTitle>
          <Icon
            className={`h-5 w-5 ${config.iconClassName}`}
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {formatNumber(summary.lowStock.count)}
            </span>
            {summary.lowStock.count > 0 && (
              <Badge variant="warning">Perlu restock</Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Produk di bawah stok minimum
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TodayTransactionWidget({ summary }: { summary: DashboardSummary }) {
  const config = WIDGET_CONFIGS.todayTransaction;
  const Icon = config.icon;

  return (
    <Link href={config.href} className="group block">
      <Card className="transition-shadow duration-200 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.title}
          </CardTitle>
          <Icon
            className={`h-5 w-5 ${config.iconClassName}`}
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(summary.todayTransaction.count)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            GR + GI + Penyesuaian hari ini
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ActiveUserWidget({ summary }: { summary: DashboardSummary }) {
  const config = WIDGET_CONFIGS.activeUser;
  const Icon = config.icon;

  return (
    <Link href={config.href} className="group block">
      <Card className="transition-shadow duration-200 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {config.title}
          </CardTitle>
          <Icon
            className={`h-5 w-5 ${config.iconClassName}`}
            aria-hidden="true"
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(summary.activeUser.count)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Pengguna dengan status aktif
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

// --- Main Export ---

/**
 * Dashboard summary widgets grid.
 * Renders 4 clickable cards: Total Produk, Stok Rendah, Transaksi Hari Ini, User Aktif.
 * Layout: 2x2 grid on desktop (md:grid-cols-2), vertical stack on mobile.
 */
export function SummaryWidgets({ summary }: SummaryWidgetsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TotalProductWidget summary={summary} />
      <LowStockWidget summary={summary} />
      <TodayTransactionWidget summary={summary} />
      <ActiveUserWidget summary={summary} />
    </div>
  );
}
