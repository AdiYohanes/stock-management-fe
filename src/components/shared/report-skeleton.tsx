"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Default number of skeleton rows to display */
const DEFAULT_ROW_COUNT = 5;

interface ReportSkeletonProps {
  /** Column header labels to display in the skeleton table */
  headers: string[];
  /** Number of skeleton rows to render (default: 5) */
  rowCount?: number;
  /** Accessible label describing what data is loading */
  ariaLabel?: string;
}

/**
 * Reusable skeleton loading state for report tables.
 * Renders a table with real headers and animated placeholder rows.
 * Consistent with adj-loading-skeleton pattern across modules.
 */
export function ReportSkeleton({
  headers,
  rowCount = DEFAULT_ROW_COUNT,
  ariaLabel = "Memuat data laporan",
}: ReportSkeletonProps) {
  return (
    <div
      className="overflow-x-auto rounded-md border"
      role="status"
      aria-label={ariaLabel}
    >
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b">
              {headers.map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">{ariaLabel}...</span>
    </div>
  );
}
