"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Number of skeleton rows to display during loading */
const SKELETON_ROW_COUNT = 5;

/** Column widths to simulate realistic audit table content */
const COLUMN_WIDTHS = [
  "w-36", // Waktu
  "w-28", // User
  "w-16", // Aksi
  "w-28", // Entitas
  "w-20", // Detail
] as const;

/**
 * Skeleton loading state for the audit trail table.
 * Renders 5 placeholder rows with accessible labeling.
 */
export function AuditSkeleton() {
  return (
    <div
      className="overflow-x-auto rounded-md border"
      role="status"
      aria-label="Memuat data audit trail"
    >
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Waktu
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              User
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Aksi
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Entitas
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Detail
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
      <span className="sr-only">Memuat data audit trail...</span>
    </div>
  );
}
