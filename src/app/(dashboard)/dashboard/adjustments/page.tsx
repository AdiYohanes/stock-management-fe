"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Plus, Eye, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_ADJUSTMENTS } from "@/lib/constants/mock-adjustment";
import { formatNumber } from "@/lib/formatters";
import type { StockAdjustment, AdjustmentStatus } from "@/lib/types/adjustment";
import { ADJUSTMENT_REASON_LABELS } from "@/lib/types/adjustment";
import { useAdjustmentStore } from "@/stores/adjustment-store";
import { AdjLoadingSkeleton } from "@/components/shared/adj-loading-skeleton";
import { AdjEmptyState } from "@/components/shared/adj-empty-state";

/** Format ISO date string to Indonesian locale (e.g. "22 Mei 2026") */
function formatDateID(isoDate: string | null | undefined): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

const col = createColumnHelper<StockAdjustment>();

const columns = [
  col.accessor("adj_number", {
    header: "Nomor ADJ",
    cell: (info) => (
      <span className="whitespace-nowrap font-mono text-xs">
        {info.getValue() ?? "—"}
      </span>
    ),
  }),
  col.accessor("date", {
    header: "Tanggal",
    cell: (info) => (
      <span className="whitespace-nowrap">{formatDateID(info.getValue())}</span>
    ),
  }),
  col.accessor("product_name", {
    header: "Produk",
    cell: (info) => info.getValue() ?? "—",
  }),
  col.accessor("reason", {
    header: "Alasan",
    cell: (info) => {
      const reason = info.getValue();
      return reason ? (ADJUSTMENT_REASON_LABELS[reason] ?? reason) : "—";
    },
  }),
  col.accessor("qty_before", {
    header: "Qty Sebelum",
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="tabular-nums">
          {typeof val === "number" ? formatNumber(val) : "—"}
        </span>
      );
    },
  }),
  col.accessor("qty_after", {
    header: "Qty Sesudah",
    cell: (info) => {
      const val = info.getValue();
      return (
        <span className="tabular-nums">
          {typeof val === "number" ? formatNumber(val) : "—"}
        </span>
      );
    },
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.display({
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const isPending = row.original.status === "PENDING";
      return (
        <div className="flex items-center gap-1">
          <Link href={`/dashboard/adjustments/${row.original.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Eye className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">Lihat</span>
            </Button>
          </Link>
          {isPending && (
            <Link href={`/dashboard/adjustments/${row.original.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] min-w-[44px] border-amber-300 text-amber-700 hover:bg-amber-50 active:bg-amber-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <ClipboardCheck className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Review</span>
              </Button>
            </Link>
          )}
        </div>
      );
    },
  }),
];

export default function AdjustmentsPage() {
  const { adjustments: storeAdjustments } = useAdjustmentStore();
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Replace with backend API — GET /api/v1/adjustments (paginated)
  // Simulate initial data fetch delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Merge store adjustments with mock data, sorted by date descending
  // Gracefully handle null/undefined dates in sort
  const allAdjustments = useMemo(() => {
    const merged = [...storeAdjustments, ...MOCK_ADJUSTMENTS];
    return merged.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [storeAdjustments]);

  const table = useReactTable({
    data: allAdjustments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Penyesuaian Stok</h1>
        <Link href="/dashboard/adjustments/new">
          <Button className="w-full min-h-[44px] sm:w-auto focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98] transition-transform">
            <Plus className="mr-2 h-4 w-4" />
            Ajukan Penyesuaian
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && <AdjLoadingSkeleton />}

      {/* Empty State */}
      {!isLoading && allAdjustments.length === 0 && <AdjEmptyState />}

      {/* Table */}
      {!isLoading && allAdjustments.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground"
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
                    <td key={cell.id} className="px-4 py-3">
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
      )}
    </div>
  );
}

/** Consistent status badge — matches Inventory & Receiving module patterns */
function StatusBadge({ status }: { status: AdjustmentStatus }) {
  const config: Record<AdjustmentStatus, { className: string; label: string }> =
    {
      PENDING: {
        className: "bg-amber-100 text-amber-800",
        label: "Menunggu",
      },
      APPROVED: {
        className: "bg-emerald-100 text-emerald-800",
        label: "Disetujui",
      },
      REJECTED: {
        className: "bg-red-100 text-red-800",
        label: "Ditolak",
      },
    };

  const { className, label } = config[status] ?? {
    className: "bg-gray-100 text-gray-800",
    label: status ?? "—",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
