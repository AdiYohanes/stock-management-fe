"use client";

import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const gi = MOCK_GOODS_ISSUES.find((g) => g.id === id);

  const handleDownloadPdf = useCallback(async () => {
    if (!gi) return;

    setIsGeneratingPdf(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { GIPdfSlip } =
        await import("@/components/features/dispatching/gi-pdf-slip");

      const blob = await pdf(<GIPdfSlip data={gi} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${gi.gi_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF berhasil diunduh");
    } catch {
      toast.error("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [gi]);

  if (!gi) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/dispatching">
          <Button variant="ghost" size="sm" className="min-h-[44px] md:min-h-0">
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
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px] md:min-h-0 transition-all duration-150 hover:bg-accent active:scale-95"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Kembali ke Daftar
        </Button>
      </Link>

      {/* Header info card */}
      <div className="rounded-md border p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-bold font-mono">
            {gi.gi_number}
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <StatusBadge status={gi.status} />
            {gi.status === "COMPLETED" && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="min-h-[44px] md:min-h-0 w-full sm:w-auto transition-all duration-150 active:scale-95"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="mr-1.5 h-4 w-4" />
                )}
                Cetak Bukti
              </Button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div>
            <span className="text-muted-foreground block text-xs mb-0.5">
              Tanggal
            </span>
            <span className="font-medium">{formatDate(gi.date)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs mb-0.5">
              Tujuan
            </span>
            <span className="font-medium">{gi.destination || "-"}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs mb-0.5">
              Total Item
            </span>
            <span className="font-medium">{formatNumber(gi.items.length)}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-xs mb-0.5">
              Total Qty
            </span>
            <span className="font-medium">{formatNumber(totalQty)}</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground pt-2 border-t">
          Dibuat oleh: <span className="font-medium">{gi.created_by}</span>
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
              className="border-b transition-colors duration-150 hover:bg-muted/50"
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
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${cls}`}
    >
      {status === "COMPLETED" ? "Selesai" : "Draft"}
    </span>
  );
}
