"use client";

import { SearchX } from "lucide-react";

/**
 * Empty state placeholder for the audit trail table.
 * Shown when filters produce zero matching results.
 */
export function AuditEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        Tidak ada log audit untuk filter ini
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Coba ubah kriteria filter atau reset semua filter untuk melihat seluruh
        riwayat aktivitas.
      </p>
    </div>
  );
}
