"use client";

import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

// Placeholder data — will be replaced with API call via TanStack Query
const MOCK_GOODS_ISSUES = [
  {
    id: "gi-001",
    gi_number: "GI-20260529-0001",
    date: "2026-05-29",
    destination: "Divisi Marketing",
    status: "COMPLETED" as const,
    items: [
      { product_name: "Kertas A4", qty: 10 },
      { product_name: "Tinta Printer", qty: 5 },
    ],
  },
  {
    id: "gi-002",
    gi_number: "GI-20260529-0002",
    date: "2026-05-29",
    destination: "Gudang Cabang",
    status: "DRAFT" as const,
    items: [{ product_name: "Kardus Besar", qty: 20 }],
  },
];

export default function DispatchingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengeluaran Barang</h1>
        <Link href="/dashboard/dispatching/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Buat GI Baru
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Nomor GI
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tanggal
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Tujuan
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Total Item
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Total Qty
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_GOODS_ISSUES.map((gi) => (
              <tr
                key={gi.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                <td className="px-4 py-3 font-mono">{gi.gi_number}</td>
                <td className="px-4 py-3">{gi.date}</td>
                <td className="px-4 py-3">{gi.destination || "-"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={gi.status} />
                </td>
                <td className="px-4 py-3">{gi.items.length}</td>
                <td className="px-4 py-3">
                  {gi.items.reduce((sum, i) => sum + i.qty, 0)}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/dispatching/${gi.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-1.5 h-4 w-4" />
                      Lihat Detail
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "COMPLETED" | "DRAFT" }) {
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
