"use client";

import { FileSpreadsheet } from "lucide-react";

interface ReportEmptyStateProps {
  /** Primary message to display */
  message?: string;
  /** Secondary description text */
  description?: string;
}

/**
 * Reusable empty state placeholder for report tables.
 * Shown when filters return 0 results.
 * Consistent with adj-empty-state and inventory EmptyState patterns.
 */
export function ReportEmptyState({
  message = "Tidak ada data untuk filter ini",
  description = "Coba ubah filter atau rentang tanggal untuk menampilkan data.",
}: ReportEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 px-6 text-center">
      {/* Illustration placeholder */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-lg font-semibold">{message}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
