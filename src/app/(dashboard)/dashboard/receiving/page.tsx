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
import { MOCK_GOODS_RECEIPTS } from "@/lib/constants/mock-receiving";
import type { GoodsReceipt } from "@/lib/types/receiving";

const col = createColumnHelper<GoodsReceipt>();

const columns = [
  col.accessor("gr_number", { header: "Nomor GR" }),
  col.accessor("date", { header: "Tanggal" }),
  col.accessor("supplier_name", { header: "Supplier" }),
  col.accessor("status", {
    header: "Status",
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.display({
    id: "total_items",
    header: "Total Item",
    cell: ({ row }) => row.original.items.length,
  }),
  col.display({
    id: "total_qty",
    header: "Total Qty",
    cell: ({ row }) => row.original.items.reduce((sum, i) => sum + i.qty, 0),
  }),
  col.display({
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <Link href={`/dashboard/receiving/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Eye className="mr-1.5 h-4 w-4" />
          Lihat Detail
        </Button>
      </Link>
    ),
  }),
];

export default function ReceivingPage() {
  const table = useReactTable({
    data: MOCK_GOODS_RECEIPTS,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Penerimaan Barang</h1>
        <Link href="/dashboard/receiving/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat GR Baru
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
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

function StatusBadge({ status }: { status: GoodsReceipt["status"] }) {
  const cls =
    status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status === "COMPLETED" ? "Selesai" : "Draft"}
    </span>
  );
}
