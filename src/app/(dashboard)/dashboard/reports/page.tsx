"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber, formatCurrency } from "@/lib/formatters";
import { exportCsv } from "@/lib/utils/export-csv";
import {
  MOCK_REPORT_PRODUCTS,
  REPORT_CATEGORIES,
  type ReportProduct,
} from "@/lib/constants/mock-report-products";

// --- Types ---

type StockStatusLabel = "Tersedia" | "Rendah" | "Habis";

interface ReportRow extends ReportProduct {
  status: StockStatusLabel;
  inventory_value: number;
}

// --- Helpers ---

function getStockStatusLabel(qty: number, min: number): StockStatusLabel {
  if (qty === 0) return "Habis";
  if (min > 0 && qty <= min) return "Rendah";
  return "Tersedia";
}

const STATUS_BADGE_CLASSES: Record<StockStatusLabel, string> = {
  Tersedia: "bg-emerald-100 text-emerald-800",
  Rendah: "bg-amber-100 text-amber-800",
  Habis: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS: StockStatusLabel[] = ["Tersedia", "Rendah", "Habis"];

// --- Column Definitions ---

const columnHelper = createColumnHelper<ReportRow>();

const columns = [
  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("name", {
    header: "Nama Produk",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("category", {
    header: "Kategori",
    cell: (info) => info.getValue(),
    filterFn: "equals",
  }),
  columnHelper.accessor("unit", {
    header: "Satuan",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("stock_qty", {
    header: "Stok",
    cell: (info) => (
      <span className="font-mono">{formatNumber(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const status = info.getValue();
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            STATUS_BADGE_CLASSES[status],
          )}
        >
          {status}
        </span>
      );
    },
    filterFn: "equals",
  }),
  columnHelper.accessor("inventory_value", {
    header: "Nilai Inventaris",
    cell: (info) => (
      <span className="font-mono">{formatCurrency(info.getValue())}</span>
    ),
  }),
];

// --- Page Component ---

export default function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Transform mock data into report rows
  const data: ReportRow[] = useMemo(
    () =>
      MOCK_REPORT_PRODUCTS.map((product) => ({
        ...product,
        status: getStockStatusLabel(product.stock_qty, product.stock_min),
        inventory_value: product.stock_qty * product.cost_price,
      })),
    [],
  );

  // Build column filters from dropdown state
  const columnFilters: ColumnFiltersState = useMemo(() => {
    const filters: ColumnFiltersState = [];
    if (categoryFilter) {
      filters.push({ id: "category", value: categoryFilter });
    }
    if (statusFilter) {
      filters.push({ id: "status", value: statusFilter });
    }
    return filters;
  }, [categoryFilter, statusFilter]);

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // CSV export handler — uses raw numbers, no formatting
  const handleExportCsv = () => {
    const filteredRows = table.getFilteredRowModel().rows;

    const headers = [
      "SKU",
      "Nama Produk",
      "Kategori",
      "Satuan",
      "Stok",
      "Status",
      "Nilai Inventaris",
    ];

    const rows = filteredRows.map((row) => {
      const original = row.original;
      return [
        original.sku,
        original.name,
        original.category,
        original.unit,
        original.stock_qty,
        original.status,
        original.inventory_value,
      ];
    });

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    exportCsv({
      headers,
      rows,
      filename: `laporan-stok-${today}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan Stok Saat Ini</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan stok produk beserta nilai inventaris
          </p>
        </div>
        <Button onClick={handleExportCsv}>
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
          {REPORT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Filter status stok"
        >
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} produk ditampilkan
        </span>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left font-medium text-muted-foreground"
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
              {table.getFilteredRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Tidak ada data yang sesuai filter
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getFilteredRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
