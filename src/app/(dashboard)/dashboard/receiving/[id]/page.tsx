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
import { MOCK_GOODS_RECEIPTS } from "@/lib/constants/mock-receiving";
import type { GoodsReceiptItem, GoodsReceipt } from "@/lib/types/receiving";

const col = createColumnHelper<GoodsReceiptItem>();

const columns = [
  col.accessor("sku", { header: "SKU" }),
  col.accessor("product_name", { header: "Produk" }),
  col.accessor("qty", { header: "Qty" }),
  col.accessor("unit_name", { header: "Satuan" }),
  col.accessor("batch_no", { header: "Batch No", cell: (info) => info.getValue() ?? "-" }),
  col.accessor("notes", { header: "Catatan", cell: (info) => info.getValue() ?? "-" }),
];

export default function ReceivingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const gr = MOCK_GOODS_RECEIPTS.find((g) => g.id === id);

  if (!gr) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/receiving">
          <Button variant="ghost" size="sm"><ArrowLeft className="mr-1.5 h-4 w-4" />Kembali</Button>
        </Link>
        <p className="text-muted-foreground">Data penerimaan tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/receiving">
        <Button variant="ghost" size="sm"><ArrowLeft className="mr-1.5 h-4 w-4" />Kembali ke Daftar</Button>
      </Link>

      {/* Header Info */}
      <div className="rounded-md border p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{gr.gr_number}</h1>
          <StatusBadge status={gr.status} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><span className="text-muted-foreground">Tanggal:</span> {gr.date}</div>
          <div><span className="text-muted-foreground">Supplier:</span> {gr.supplier_name}</div>
          <div><span className="text-muted-foreground">Dibuat oleh:</span> {gr.created_by}</div>
        </div>
      </div>

      {/* Item Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Detail Item</h2>
        <ItemTable items={gr.items} />
      </div>
    </div>
  );
}

function ItemTable({ items }: { items: GoodsReceiptItem[] }) {
  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
