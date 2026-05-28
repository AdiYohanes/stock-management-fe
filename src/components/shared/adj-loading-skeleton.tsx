"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Number of skeleton rows to display */
const SKELETON_ROW_COUNT = 5;

/** Column widths to simulate realistic table content */
const COLUMN_WIDTHS = [
  "w-28", // Nomor ADJ
  "w-24", // Tanggal
  "w-32", // Produk
  "w-20", // Alasan
  "w-16", // Qty Sebelum
  "w-16", // Qty Sesudah
  "w-20", // Status
  "w-24", // Aksi
] as const;

/**
 * Skeleton loading state for the adjustments list table.
 * Renders 5 placeholder rows with accessible labeling.
 */
export function AdjLoadingSkeleton() {
  return (
    <div
      className="overflow-x-auto rounded-md border"
      role="status"
      aria-label="Memuat data penyesuaian"
    >
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Nomor ADJ
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Tanggal
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Produk
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Alasan
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Qty Sebelum
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Qty Sesudah
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {COLUMN_WIDTHS.map((width, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton className={`h-4 ${width}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Memuat data penyesuaian stok...</span>
    </div>
  );
}
