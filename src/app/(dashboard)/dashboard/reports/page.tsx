"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StockReportContent } from "@/components/features/reports/stock-report-content";
import { MutationReportContent } from "@/components/features/reports/mutation-report-content";
import { ValuationReportContent } from "@/components/features/reports/valuation-report-content";

/**
 * Reports page — Tab wrapper for all report types.
 * Switches between Stock, Mutation, and Valuation reports client-side.
 * URL stays at /dashboard/reports (no page reload on tab switch).
 */
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lihat dan ekspor laporan stok, mutasi harian, dan nilai inventaris
        </p>
      </div>

      {/* Tab Navigation */}
      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="w-full md:w-auto flex">
          <TabsTrigger value="stock" className="flex-1 md:flex-none">
            Stok Saat Ini
          </TabsTrigger>
          <TabsTrigger value="mutation" className="flex-1 md:flex-none">
            Mutasi Harian
          </TabsTrigger>
          <TabsTrigger value="valuation" className="flex-1 md:flex-none">
            Nilai Inventaris
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <StockReportContent />
        </TabsContent>

        <TabsContent value="mutation">
          <MutationReportContent />
        </TabsContent>

        <TabsContent value="valuation">
          <ValuationReportContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
