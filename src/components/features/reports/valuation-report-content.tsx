"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { exportCsv } from "@/lib/utils/export-csv";
import { ReportSkeleton } from "@/components/shared/report-skeleton";
import { ReportEmptyState } from "@/components/shared/report-empty-state";
import {
  MOCK_PRODUCTS_FLAT,
  FLAT_PRODUCT_CATEGORIES,
} from "@/lib/constants/mock-products-flat";
import {
  aggregateByCategory,
  filterValuationRows,
  type ValuationRow,
} from "@/lib/utils/aggregate-valuation";

// --- Column Definitions ---

const columnHelper = createColumnHelper<ValuationRow>();

const columns = [
  columnHelper.accessor("category", {
    header: "Kategori",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("sku_count", {
    header: "Jumlah SKU",
    cell: (info) => (
      <span className="font-mono">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("total_stock", {
    header: "Total Stok",
    cell: (info) => (
      <span className="font-mono">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("inventory_value", {
    header: "Nilai Inventaris",
    cell: (info) => (
      <span className="font-mono">{formatCurrency(info.getValue())}</span>
    ),
  }),
];

const SKELETON_HEADERS = [
  "Kategori",
  "Jumlah SKU",
  "Total Stok",
  "Nilai Inventaris",
];

// --- Component ---

/**
 * Inventory Valuation Report content component.
 * Aggregates products by category showing SKU count, total stock, and value.
 */
export function ValuationReportContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Simulate initial data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Aggregate mock data by category
  const aggregatedData = useMemo(
    () => aggregateByCategory(MOCK_PRODUCTS_FLAT),
    [],
  );

  // Apply category filter
  const filteredData = useMemo(
    () => filterValuationRows(aggregatedData, categoryFilter),
    [aggregatedData, categoryFilter],
  );

  // Compute grand total from filtered data
  const grandTotal = useMemo(
    () =>
      filteredData.reduce(
        (acc, row) => ({
          sku_count: acc.sku_count + row.sku_count,
          total_stock: acc.total_stock + row.total_stock,
          inventory_value: acc.inventory_value + row.inventory_value,
        }),
        { sku_count: 0, total_stock: 0, inventory_value: 0 },
      ),
    [filteredData],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // CSV export handler
  const handleExportCsv = () => {
    const headers = [
      "Kategori",
      "Jumlah SKU",
      "Total Stok",
      "Nilai Inventaris",
    ];

    const rows: (string | number)[][] = filteredData.map((row) => [
      row.category,
      row.sku_count,
      row.total_stock,
      row.inventory_value,
    ]);

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    exportCsv({
      headers,
      rows,
      filename: `laporan-nilai-inventaris-${today}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Ringkasan nilai inventaris per kategori produk
          </p>
        </div>
        <Button onClick={handleExportCsv} className="w-full sm:w-auto">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter kategori"
        >
          <option value="">Semua Kategori</option>
          {FLAT_PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <span className="text-sm text-muted-foreground">
          {filteredData.length} kategori ditampilkan
        </span>
      </div>

      {/* Table / Loading / Empty */}
      {isLoading ? (
        <ReportSkeleton
          headers={SKELETON_HEADERS}
          rowCount={4}
          ariaLabel="Memuat data nilai inventaris"
        />
      ) : filteredData.length === 0 ? (
        <ReportEmptyState
          message="Tidak ada data nilai inventaris untuk filter ini"
          description="Coba ubah kategori untuk menampilkan data."
        />
      ) : (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {/* Grand Total Footer */}
              {filteredData.length > 0 && (
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td className="px-4 py-3 font-bold">Total</td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {formatNumber(grandTotal.sku_count)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {formatNumber(grandTotal.total_stock)}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      {formatCurrency(grandTotal.inventory_value)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
