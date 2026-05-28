"use client";

import { ValuationReportContent } from "@/components/features/reports/valuation-report-content";

/**
 * Standalone Valuation Report page.
 * Also accessible via the Tabs on /dashboard/reports.
 * Kept as a separate route for direct linking / bookmarking.
 */
export default function ValuationReportPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Laporan Nilai Inventaris</h1>
      </div>

      <ValuationReportContent />
    </div>
  );
}
