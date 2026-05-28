"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber, formatDateTimeID } from "@/lib/formatters";
import { exportCsv } from "@/lib/utils/export-csv";
import { ReportSkeleton } from "@/components/shared/report-skeleton";
import { ReportEmptyState } from "@/components/shared/report-empty-state";
import {
  MOCK_MUTATION_TRANSACTIONS,
  TRANSACTION_TYPE_OPTIONS,
  type MutationTransaction,
  type TransactionType,
} from "@/lib/constants/mock-mutation-transactions";

// --- Helpers ---

const TYPE_BADGE_CLASSES: Record<TransactionType, string> = {
  GR: "bg-emerald-100 text-emerald-800",
  GI: "bg-blue-100 text-blue-800",
  ADJ: "bg-amber-100 text-amber-800",
};

const TYPE_LABELS: Record<TransactionType, string> = {
  GR: "Penerimaan",
  GI: "Pengeluaran",
  ADJ: "Penyesuaian",
};

/** Debounce delay (ms) to prevent double-click on export button */
const EXPORT_DEBOUNCE_MS = 500;

// --- Column Definitions ---

const columnHelper = createColumnHelper<MutationTransaction>();

const columns = [
  columnHelper.accessor("date", {
    header: "Tanggal",
    cell: (info) => (
      <span className="whitespace-nowrap text-sm">
        {formatDateTimeID(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("transaction_no", {
    header: "No. Transaksi",
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Tipe",
    cell: (info) => {
      const type = info.getValue();
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            TYPE_BADGE_CLASSES[type],
          )}
        >
          {TYPE_LABELS[type]}
        </span>
      );
    },
    filterFn: "equals",
  }),
  columnHelper.accessor("product_name", {
    header: "Produk",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("qty", {
    header: "Qty",
    cell: (info) => {
      const qty = info.getValue();
      const isPositive = qty > 0;
      return (
        <span
          className={cn(
            "font-mono font-medium",
            isPositive ? "text-emerald-700" : "text-red-700",
          )}
        >
          {isPositive ? "+" : ""}
          {formatNumber(qty)}
        </span>
      );
    },
  }),
  columnHelper.accessor("stock_before", {
    header: "Stok Sebelum",
    cell: (info) => (
      <span className="font-mono">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("stock_after", {
    header: "Stok Sesudah",
    cell: (info) => (
      <span className="font-mono">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("user", {
    header: "Pengguna",
    cell: (info) => info.getValue(),
  }),
];

const SKELETON_HEADERS = [
  "Tanggal",
  "No. Transaksi",
  "Tipe",
  "Produk",
  "SKU",
  "Qty",
  "Stok Sebelum",
  "Stok Sesudah",
  "Pengguna",
];

// --- Component ---

/**
 * Mutation (Daily) Report content component.
 * Displays all stock mutation transactions with type and date filters.
 */
export function MutationReportContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const exportTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate initial data loading
  // TODO: Replace with backend API endpoint — GET /api/v1/reports/mutations
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup export debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (exportTimeoutRef.current) {
        clearTimeout(exportTimeoutRef.current);
      }
    };
  }, []);

  // Filter data by date (YYYY-MM-DD prefix match)
  const filteredByDate = useMemo(() => {
    if (!dateFilter) return MOCK_MUTATION_TRANSACTIONS;
    return MOCK_MUTATION_TRANSACTIONS.filter((tx) =>
      tx.date.startsWith(dateFilter),
    );
  }, [dateFilter]);

  // Build column filters from dropdown state
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = [];
    if (typeFilter) {
      filters.push({ id: "type", value: typeFilter });
    }
    return filters;
  }, [typeFilter]);

  const table = useReactTable({
    data: filteredByDate,
    columns,
    state: { columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const isExportDisabled = isExporting || filteredRowCount === 0;

  // CSV export handler with double-click prevention
  const handleExportCsv = useCallback(() => {
    if (filteredRowCount === 0) {
      toast.warning("Tidak ada data untuk diexport");
      return;
    }

    setIsExporting(true);

    const filteredRows = table.getFilteredRowModel().rows;

    const headers = [
      "Tanggal",
      "No. Transaksi",
      "Tipe",
      "Produk",
      "SKU",
      "Qty",
      "Stok Sebelum",
      "Stok Sesudah",
      "Pengguna",
    ];

    const rows = filteredRows.map((row) => {
      const original = row.original;
      return [
        original.date,
        original.transaction_no,
        original.type,
        original.product_name,
        original.sku,
        original.qty,
        original.stock_before,
        original.stock_after,
        original.user,
      ];
    });

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    // TODO: Replace with backend API endpoint — GET /api/v1/reports/mutations/export
    exportCsv({
      headers,
      rows,
      filename: `laporan-mutasi-harian-${today}`,
    });

    // Re-enable button after debounce period
    exportTimeoutRef.current = setTimeout(() => {
      setIsExporting(false);
    }, EXPORT_DEBOUNCE_MS);
  }, [filteredRowCount, table]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Riwayat mutasi stok harian (penerimaan, pengeluaran, penyesuaian)
          </p>
        </div>
        <Button
          onClick={handleExportCsv}
          disabled={isExportDisabled}
          className="w-full sm:w-auto"
          aria-label="Export data mutasi ke file CSV"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter tipe transaksi"
        >
          {TRANSACTION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter tanggal"
        />

        <span className="text-sm text-muted-foreground" aria-live="polite">
          {filteredRowCount} transaksi ditampilkan
        </span>
      </div>

      {/* Table / Loading / Empty — aria-live region for screen reader updates */}
      <div aria-live="polite" aria-atomic="true">
        {isLoading ? (
          <ReportSkeleton
            headers={SKELETON_HEADERS}
            rowCount={5}
            ariaLabel="Memuat data mutasi harian"
          />
        ) : filteredRowCount === 0 ? (
          <ReportEmptyState
            message="Tidak ada data mutasi untuk filter ini"
            description="Coba ubah tipe transaksi atau tanggal untuk menampilkan data."
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
                  {table.getFilteredRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
