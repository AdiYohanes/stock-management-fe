"use client";

import Link from "next/link";
import { BarChart3, TrendingUp, DollarSign } from "lucide-react";

const REPORT_SECTIONS = [
  {
    title: "Stok Saat Ini",
    description: "Laporan posisi stok terkini per produk dan kategori.",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Mutasi Harian",
    description: "Riwayat pergerakan stok masuk dan keluar per hari.",
    href: "/dashboard/reports/mutation",
    icon: TrendingUp,
  },
  {
    title: "Valuasi Inventaris",
    description: "Nilai total inventaris berdasarkan harga beli terakhir.",
    href: "/dashboard/reports/valuation",
    icon: DollarSign,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Laporan</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORT_SECTIONS.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group rounded-lg border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold group-hover:text-primary">
                {section.title}
              </h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {section.description}
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
        <p className="mt-4 text-lg font-medium">Pilih jenis laporan di atas</p>
        <p className="mt-1 text-sm">
          Data laporan akan ditampilkan setelah terhubung dengan backend.
        </p>
      </div>
    </div>
  );
}
