"use client";

import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_ADJUSTMENTS } from "@/lib/constants/mock-adjustment";
import { formatNumber } from "@/lib/formatters";
import type { StockAdjustment, AdjustmentStatus } from "@/lib/types/adjustment";
import { ADJUSTMENT_REASON_LABELS } from "@/lib/types/adjustment";

/** Format ISO date string to Indonesian locale (e.g. "22 Mei 2026") */
function formatDateID(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

const col = createColumnHelper<StockAdjustment>();

const columns = [
  col.accessor("adj_number", { header: "Nomor ADJ" }),
  col.accessor("date", {
    header: "Tanggal",
    cell: (info) => formatDateID(info.getValue()),
  }),
  col.accessor("product_name", { header: "Produk" }),
  col.accessor("reason", {
    header: "Alasan",
    cell: (info) => ADJUSTMENT_REASON_LABELS[info.getValue()],
  }),
  col.accessor("qty_before", {
    header: "Qty Sebelum",
    cell: (info) => formatNumber(info.getValue()),
  }),
  col.accessor("qty_after", {
    header: "Qty Sesudah",
    cell: (info) => formatNumber(info.getValue()),
  }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.display({
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <Link href={`/dashboard/adjustments/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="mr-1.5 h-4 w-4" />
          Lihat Detail
        </Button>
      </Link>
    ),
  }),
];

export default function AdjustmentsPage() {
  const table = useReactTable({
    data: MOCK_ADJUSTMENTS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Penyesuaian Stok</h1>
        <Link href="/dashboard/adjustments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajukan Penyesuaian
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
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
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

  const { className, label } = config[status];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
