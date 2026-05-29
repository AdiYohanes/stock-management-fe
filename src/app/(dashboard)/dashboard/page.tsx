"use client";

import { useMemo } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { SummaryWidgets } from "@/components/features/dashboard/summary-widgets";
import { RecentActivityList } from "@/components/features/dashboard/recent-activity-list";
import { QuickActionsPanel } from "@/components/features/dashboard/quick-actions-panel";
import { computeDashboardSummary } from "@/lib/utils/dashboard-aggregates";
import { getRecentActivities } from "@/lib/utils/dashboard-helpers";
import { MOCK_PRODUCTS } from "@/lib/constants/mock-inventory";
import { MOCK_TRANSACTIONS } from "@/lib/constants/mock-transactions";
import { MOCK_USERS } from "@/lib/constants/mock-users";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const summary = useMemo(
    () => computeDashboardSummary(MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_USERS),
    [],
  );

  const recentActivities = useMemo(
    () => getRecentActivities(MOCK_TRANSACTIONS),
    [],
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Ringkasan Inventaris</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Selamat datang, {user?.name ?? "Pengguna"}. Berikut ringkasan kondisi
          gudang Anda.
        </p>
      </div>

      {/* Summary Widgets */}
      <SummaryWidgets summary={summary} />

      {/* Recent Activity Timeline & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentActivityList activities={recentActivities} />
        <QuickActionsPanel />
      </div>
    </div>
  );
}
