"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_GOODS_ISSUES } from "@/lib/constants/mock-dispatching";
import { formatDate, formatNumber } from "@/lib/formatters";
import type { GoodsIssue } from "@/lib/types/dispatching";

const col = createColumnHelper<GoodsIssue>();

const columns = [
  col.accessor("gi_number", { header: "Nomor GI" }),
  col.accessor("date", {
    header: "Tanggal",
    cell: (info) => formatDate(info.getValue()),
  }),
  col.accessor("destination", { header: "Tujuan" }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.display({
    id: "total_items",
    header: "Total Item",
    cell: ({ row }) => formatNumber(row.original.items.length),
  }),
  col.display({
    id: "total_qty",
    header: "Total Qty",
    cell: ({ row }) =>
      formatNumber(row.original.items.reduce((sum, i) => sum + i.qty, 0)),
  }),
  col.display({
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <Link href={`/dashboard/dispatching/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="min-h-[44px] md:min-h-0">
          <Eye className="mr-1.5 h-4 w-4" />
          Lihat Detail
        </Button>
      </Link>
    ),
  }),
];

export default function DispatchingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GoodsIssue[]>([]);

  // Simulate initial fetch delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_GOODS_ISSUES);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">Pengeluaran Barang</h1>
        <Button className="min-h-[44px] w-full sm:w-auto" disabled>
          <Plus className="mr-2 h-4 w-4" />
          Buat GI Baru
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
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
          </table>
        </div>
      )}
    </div>
  );
}

/** Status badge with color coding */
function StatusBadge({ status }: { status: GoodsIssue["status"] }) {
  const cls =
    status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status === "COMPLETED" ? "Selesai" : "Draft"}
    </span>
  );
}

/** Loading skeleton placeholder */
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

/** Empty state placeholder (to be expanded in Task 2) */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-12 text-center">
      <p className="text-muted-foreground">
        Belum ada data pengeluaran barang.
      </p>
    </div>
  );
}
