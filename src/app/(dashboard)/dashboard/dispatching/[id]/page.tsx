"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_GOODS_ISSUES } from "@/lib/constants/mock-dispatching";
import { formatDate, formatNumber } from "@/lib/formatters";
import type { GoodsIssueItem, GoodsIssue } from "@/lib/types/dispatching";

const col = createColumnHelper<GoodsIssueItem>();

const columns = [
  col.accessor("sku", { header: "SKU" }),
  col.accessor("product_name", { header: "Produk" }),
  col.accessor("qty", {
    header: "Qty",
    cell: (info) => formatNumber(info.getValue()),
  }),
  col.accessor("unit_name", { header: "Satuan" }),
  col.accessor("notes", {
    header: "Catatan",
    cell: (info) => info.getValue() ?? "-",
  }),
];

export default function DispatchingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const gi = MOCK_GOODS_ISSUES.find((g) => g.id === id);

  if (!gi) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/dispatching">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <p className="text-muted-foreground">
          Data pengeluaran tidak ditemukan.
        </p>
      </div>
    );
  }

  const totalQty = gi.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link href="/dashboard/dispatching">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Kembali ke Daftar
        </Button>
      </Link>

      {/* Header info card */}
      <div className="rounded-md border p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold">{gi.gi_number}</h1>
          <StatusBadge status={gi.status} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tanggal:</span>{" "}
            {formatDate(gi.date)}
          </div>
          <div>
            <span className="text-muted-foreground">Tujuan:</span>{" "}
            {gi.destination}
          </div>
          <div>
            <span className="text-muted-foreground">Total Item:</span>{" "}
            {formatNumber(gi.items.length)}
          </div>
          <div>
            <span className="text-muted-foreground">Total Qty:</span>{" "}
            {formatNumber(totalQty)}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Dibuat oleh: {gi.created_by}
        </div>
      </div>

      {/* Item detail table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Detail Item</h2>
        <ItemTable items={gi.items} />
      </div>
    </div>
  );
}

/** Item detail table using TanStack Table */
function ItemTable({ items }: { items: GoodsIssueItem[] }) {
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
